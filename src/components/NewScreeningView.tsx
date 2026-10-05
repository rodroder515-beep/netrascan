import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, Image as ImageIcon, Sparkles, AlertCircle, RefreshCw, X, SwitchCamera, Focus } from 'lucide-react';
import { PatientIntake } from '../services/api';
import { DEMO_PRESET_PATIENTS } from '../mocks/mockPatients';

interface NewScreeningViewProps {
  onProceedToQualityGate: (patient: PatientIntake, imageData: string) => void;
  onCancel: () => void;
}

export const NewScreeningView: React.FC<NewScreeningViewProps> = ({
  onProceedToQualityGate,
  onCancel,
}) => {
  const [patient, setPatient] = useState<PatientIntake>({
    id: `PT-${Math.floor(4000 + Math.random() * 900)}`,
    name: 'Sunita Devi',
    age: 52,
    gender: 'F',
    village: 'Ramgarh Sub-centre',
    phone: '+91 98231 •••••',
    diabetesDurationYears: 8,
    randomBloodSugar: 204,
    hba1c: 8.6,
    eye: 'OD',
    screeningDate: new Date().toISOString().split('T')[0],
  });

  const [selectedImage, setSelectedImage] = useState<string>('/demo-fundus-dr.jpg');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  
  // Camera capture states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoStreamRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop media stream utility
  const stopLiveCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCameraActive(false);
    setCameraError(null);
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Start live camera stream
  const startLiveCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    stopLiveCamera();
    setCameraError(null);
    setIsCameraActive(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback to any available video stream
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      mediaStreamRef.current = stream;
      setIsLiveCameraActive(true);

      // Connect stream to video element
      setTimeout(() => {
        if (videoStreamRef.current) {
          videoStreamRef.current.srcObject = stream;
          videoStreamRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: any) {
      console.warn('Live camera access error:', err);
      setCameraError(
        err.message || 'Unable to access live camera stream. You can run the optical alignment simulation instead.'
      );
      // Fallback: trigger simulated optical acquisition after brief notification
      setIsLiveCameraActive(false);
    }
  };

  // Switch camera front/back
  const handleToggleFacingMode = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    startLiveCamera(nextFacing);
  };

  // Capture snapshot from live camera stream
  const handleSnapFromLiveCamera = () => {
    const video = videoStreamRef.current;
    if (!video) return;

    // Trigger visual shutter flash
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 250);

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    const size = Math.min(width, height);

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Center crop to square 1:1 format
      const startX = (width - size) / 2;
      const startY = (height - size) / 2;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setSelectedImage(dataUrl);
    }

    // Stop camera and display acquired image
    stopLiveCamera();
  };

  // Simulated optical alignment capture (useful when no fundus lens attachment is physically present)
  const handleSimulatedCameraCapture = () => {
    stopLiveCamera();
    setIsCameraActive(true);
    setTimeout(() => {
      setSelectedImage('/demo-fundus.jpg');
      setIsCameraActive(false);
    }, 1200);
  };

  const handleSelectPreset = (index: number) => {
    stopLiveCamera();
    setSelectedPresetIndex(index);
    const preset = DEMO_PRESET_PATIENTS[index];
    setPatient({
      ...preset.patient,
      id: `PT-${Math.floor(4000 + Math.random() * 900)}`,
      screeningDate: new Date().toISOString().split('T')[0],
    });
    setSelectedImage(preset.imagePath);
    setIsCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    stopLiveCamera();
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setIsCameraActive(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;
    stopLiveCamera();
    onProceedToQualityGate(patient, selectedImage);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn w-full">
      {/* Hidden canvas for video snapshot processing */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Title */}
      <div className="border-b border-[var(--rule)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-label text-[var(--amber)]">STEP 1 OF 6</span>
          <h1
            className="font-heading font-bold text-[var(--fg)] mt-1 tracking-[-0.02em] leading-[1.1]"
            style={{ fontSize: 'clamp(1.75rem, 3.8vw, 2.5rem)' }}
          >
            Patient Intake & Fundus Image Acquisition
          </h1>
          <p className="text-sm sm:text-base text-[var(--fg-soft)] mt-1.5 leading-[1.6]">
            Record clinical patient details and acquire a 45° macula-centered retinal fundus image using a mobile optical lens.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono text-[var(--teal)] px-2.5 py-1 rounded border border-[var(--teal)]/40 bg-[var(--teal)]/10">
            OFFLINE CAPTURE READY
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Patient Intake Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className="p-4 sm:p-6 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
              <h2 className="text-sm font-heading font-semibold text-[var(--fg)]">
                PATIENT DEMOGRAPHICS & CLINICAL HISTORY
              </h2>
              <span className="text-label text-[var(--fg-faint)]">DEMO INTAKE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div>
                <label className="block text-label text-[var(--fg-faint)] mb-1">
                  PATIENT ID
                </label>
                <input
                  type="text"
                  required
                  value={patient.id}
                  onChange={(e) => setPatient({ ...patient, id: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--rule)] text-[var(--fg)] font-mono focus:border-[var(--amber)] min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-label text-[var(--fg-faint)] mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={patient.name}
                  onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--rule)] text-[var(--fg)] focus:border-[var(--amber)] min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-label text-[var(--fg-faint)] mb-1">
                  AGE (YEARS)
                </label>
                <input
                  type="number"
                  required
                  min={18}
                  max={105}
                  value={patient.age}
                  onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--rule)] text-[var(--fg)] focus:border-[var(--amber)] min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-label text-[var(--fg-faint)] mb-1">
                  GENDER
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['F', 'M', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPatient({ ...patient, gender: g })}
                      className={`py-2 rounded border text-xs font-medium cursor-pointer transition-colors min-h-[40px] flex items-center justify-center ${
                        patient.gender === g
                          ? 'border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]'
                          : 'border-[var(--rule)] text-[var(--fg-soft)] hover:border-[var(--fg-soft)]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-label text-[var(--fg-faint)] mb-1">
                  VILLAGE / SUB-CENTRE LOCATION
                </label>
                <input
                  type="text"
                  required
                  value={patient.village}
                  onChange={(e) => setPatient({ ...patient, village: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--rule)] text-[var(--fg)] focus:border-[var(--amber)] min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-label text-[var(--fg-faint)] mb-1">
                  DIABETES DURATION (YEARS)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={patient.diabetesDurationYears}
                  onChange={(e) => setPatient({ ...patient, diabetesDurationYears: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--rule)] text-[var(--fg)] focus:border-[var(--amber)] min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-label text-[var(--fg-faint)] mb-1">
                  RANDOM BLOOD SUGAR (mg/dL)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 195"
                  value={patient.randomBloodSugar || ''}
                  onChange={(e) => setPatient({ ...patient, randomBloodSugar: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--rule)] text-[var(--fg)] focus:border-[var(--amber)] min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-label text-[var(--fg-faint)] mb-1">
                  HbA1c (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 8.2"
                  value={patient.hba1c || ''}
                  onChange={(e) => setPatient({ ...patient, hba1c: parseFloat(e.target.value) || undefined })}
                  className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--rule)] text-[var(--fg)] focus:border-[var(--amber)] min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-label text-[var(--fg-faint)] mb-1">
                  EYE FOR SCREENING
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPatient({ ...patient, eye: 'OD' })}
                    className={`py-2 rounded border text-xs font-medium cursor-pointer transition-colors min-h-[40px] flex items-center justify-center ${
                      patient.eye === 'OD'
                        ? 'border-[var(--amber)] bg-[var(--amber)]/20 text-[var(--amber)] font-bold'
                        : 'border-[var(--rule)] text-[var(--fg-soft)] hover:border-[var(--fg-soft)]'
                    }`}
                  >
                    OD (Right Eye)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatient({ ...patient, eye: 'OS' })}
                    className={`py-2 rounded border text-xs font-medium cursor-pointer transition-colors min-h-[40px] flex items-center justify-center ${
                      patient.eye === 'OS'
                        ? 'border-[var(--amber)] bg-[var(--amber)]/20 text-[var(--amber)] font-bold'
                        : 'border-[var(--rule)] text-[var(--fg-soft)] hover:border-[var(--fg-soft)]'
                    }`}
                  >
                    OS (Left Eye)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Demonstrations Picker */}
          <div className="p-4 rounded border border-[var(--rule)] bg-[var(--bg-2)]/60 space-y-3">
            <div className="flex items-center gap-2 text-label text-[var(--fg-soft)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--amber)]" />
              <span>LOAD PRE-CONFIGURED DEMO PROFILES</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_PRESET_PATIENTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-2.5 rounded border text-left text-xs transition-colors cursor-pointer min-h-[48px] ${
                    selectedPresetIndex === idx
                      ? 'border-[var(--amber)] bg-[var(--amber)]/10 text-[var(--fg)]'
                      : 'border-[var(--rule)] text-[var(--fg-soft)] hover:border-[var(--fg-soft)]'
                  }`}
                >
                  <div className="font-medium text-[var(--fg)] truncate">{p.patient.name}</div>
                  <div className="text-[10px] text-[var(--fg-faint)] mt-1 truncate">
                    {idx === 0 ? 'Moderate DR Indication' : idx === 1 ? 'Clear Normal Retina' : 'Ungradable Haze'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Retinal Image Acquisition (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="p-4 sm:p-6 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
              <h2 className="text-sm font-heading font-semibold text-[var(--fg)]">
                FUNDUS IMAGE CAPTURE
              </h2>
              <span className="text-label text-[var(--amber)]">
                {isLiveCameraActive ? 'LIVE CAMERA STREAM' : 'POINT OF CARE'}
              </span>
            </div>

            {/* Viewfinder Canvas: Handles Live Camera, Simulation, and Static Retinal Image */}
            <div className="aspect-square w-full rounded border border-[var(--rule)] bg-[#000] flex items-center justify-center relative overflow-hidden select-none">
              {/* Shutter Flash Animation Effect */}
              {shutterFlash && (
                <div className="absolute inset-0 bg-white z-50 animate-pulse pointer-events-none" />
              )}

              {/* 1. Live Video Stream Mode with Optical Retinal Reticle */}
              {isLiveCameraActive ? (
                <>
                  <video
                    ref={videoStreamRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* RETINAL ALIGNMENT RETICLE HUD OVERLAY */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Darkened vignette around 45° FOV optical cone */}
                    <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/70" />

                    {/* Outer 45° Macular Field boundary guide */}
                    <div className="w-[82%] h-[82%] rounded-full border-2 border-[var(--amber)]/80 shadow-[0_0_15px_rgba(232,145,60,0.3)] relative animate-pulse flex items-center justify-center">
                      {/* Foveal center crosshairs */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[var(--amber)]/40" />
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-[var(--amber)]/40" />

                      {/* Macula target circle */}
                      <div className="w-12 h-12 rounded-full border border-[var(--teal)]/90 bg-[var(--teal)]/10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-ping" />
                      </div>

                      {/* Optic Disc Target (offset toward nasal quadrant depending on eye) */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-10 h-14 rounded-full border border-dashed border-[var(--amber)]/70 bg-[var(--amber)]/10 flex items-center justify-center ${
                          patient.eye === 'OD' ? 'left-[10%]' : 'right-[10%]'
                        }`}
                      >
                        <span className="text-[8px] font-mono text-[var(--amber)] font-bold">
                          DISC
                        </span>
                      </div>

                      {/* 4 Optical Alignment Corner Brackets */}
                      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[var(--amber)]" />
                      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[var(--amber)]" />
                      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[var(--amber)]" />
                      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[var(--amber)]" />
                    </div>

                    {/* Reticle Top Info Banner */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between text-[10px] font-mono text-[var(--fg)]">
                      <span className="px-2 py-0.5 rounded bg-black/75 border border-[var(--teal)] text-[var(--teal)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--teal)] animate-pulse" />
                        RETICLE LOCKED · {patient.eye}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/75 border border-[var(--rule)] text-[var(--amber)]">
                        45° MACULAR TARGET
                      </span>
                    </div>

                    {/* Bottom Guidance Label */}
                    <div className="absolute bottom-16 inset-x-3 text-center">
                      <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-black/80 text-[var(--fg)] border border-[var(--rule)] shadow-sm">
                        Center patient pupil in amber circle
                      </span>
                    </div>
                  </div>

                  {/* Live Camera Controls Floating Over Video */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 z-40">
                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      className="p-2.5 rounded-full bg-black/80 border border-[var(--rule)] text-[var(--fg)] hover:text-[var(--amber)] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Switch Front/Rear Camera"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleSnapFromLiveCamera}
                      className="flex-1 px-4 py-2.5 rounded-full bg-[var(--amber)] text-black font-heading font-semibold text-xs sm:text-sm hover:bg-amber-400 transition-colors shadow-lg cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>SNAP RETINAL FRAME</span>
                    </button>

                    <button
                      type="button"
                      onClick={stopLiveCamera}
                      className="p-2.5 rounded-full bg-black/80 border border-[var(--rule)] text-[var(--fg-soft)] hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Close Live Camera"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : isCameraActive ? (
                /* 2. Simulated Optical Alignment Mode */
                <div className="flex flex-col items-center gap-3 text-center p-6 animate-pulse">
                  <RefreshCw className="w-8 h-8 text-[var(--amber)] animate-spin" />
                  <span className="text-xs font-mono text-[var(--fg)] uppercase tracking-wider">
                    ALIGNING MACULAR SENSOR...
                  </span>
                  <span className="text-[10px] text-[var(--fg-faint)]">
                    Calibrating optical 45° iris focus
                  </span>
                </div>
              ) : selectedImage ? (
                /* 3. Static Acquired Fundus Photo */
                <>
                  <img
                    src={selectedImage}
                    alt="Acquired retinal fundus"
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle 45° crosshairs guide */}
                  <div className="absolute inset-0 pointer-events-none border border-[var(--rule)] m-4 rounded-full opacity-35" />
                  <div className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg)]/85 text-[var(--fg-soft)] border border-[var(--rule)]">
                    45° FOV · {patient.eye}
                  </div>
                  <div className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg)]/85 text-[var(--teal)] border border-[var(--teal)]/40">
                    RETINA ACQUIRED
                  </div>
                </>
              ) : (
                /* 4. Empty State */
                <div className="flex flex-col items-center gap-2 text-center p-6 text-[var(--fg-soft)]">
                  <ImageIcon className="w-10 h-10 text-[var(--fg-faint)]" />
                  <span className="text-xs">No retinal image loaded</span>
                </div>
              )}
            </div>

            {/* Camera error notification if browser denies permissions */}
            {cameraError && (
              <div className="p-3 rounded border border-[var(--amber)]/40 bg-[var(--amber)]/10 text-xs text-[var(--fg)] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[var(--amber)] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="leading-relaxed">{cameraError}</p>
                  <button
                    type="button"
                    onClick={handleSimulatedCameraCapture}
                    className="mt-1.5 text-xs text-[var(--amber)] underline font-medium cursor-pointer"
                  >
                    Click to run simulated optical sensor acquisition instead →
                  </button>
                </div>
              </div>
            )}

            {/* Three Primary Acquisition Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* 1. LIVE CAMERA / CAPTURE BUTTON */}
              <button
                type="button"
                onClick={() => startLiveCamera()}
                className={`flex flex-col items-center justify-center p-3 rounded border transition-all cursor-pointer min-h-[52px] ${
                  isLiveCameraActive
                    ? 'border-[var(--amber)] bg-[var(--amber)]/15 text-[var(--amber)]'
                    : 'border-[var(--rule)] hover:border-[var(--amber)] hover:bg-[var(--bg)] text-xs text-[var(--fg)]'
                }`}
              >
                <Camera className="w-4 h-4 mb-1 text-[var(--amber)]" />
                <span className="font-heading font-medium text-[11px]">LIVE CAMERA</span>
              </button>

              {/* 2. UPLOAD FILE */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-3 rounded border border-[var(--rule)] hover:border-[var(--fg-soft)] hover:bg-[var(--bg)] text-xs text-[var(--fg)] transition-all cursor-pointer min-h-[52px]"
              >
                <Upload className="w-4 h-4 mb-1 text-[var(--fg-soft)]" />
                <span className="font-heading font-medium text-[11px]">UPLOAD IMAGE</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* 3. LOAD DEMO IMAGE */}
              <button
                type="button"
                onClick={() => handleSelectPreset(0)}
                className="flex flex-col items-center justify-center p-3 rounded border border-[var(--teal)]/50 bg-[var(--teal)]/10 hover:bg-[var(--teal)]/20 text-xs text-[var(--fg)] transition-all cursor-pointer min-h-[52px]"
              >
                <Sparkles className="w-4 h-4 mb-1 text-[var(--teal)]" />
                <span className="font-heading font-medium text-[11px]">DEMO PRESET</span>
              </button>
            </div>

            {/* Optical sensor simulation fallback link */}
            <div className="pt-1 flex items-center justify-between text-xs text-[var(--fg-faint)]">
              <button
                type="button"
                onClick={handleSimulatedCameraCapture}
                className="hover:text-[var(--fg)] underline cursor-pointer text-[11px] font-mono"
              >
                Or simulate lens alignment (Demo)
              </button>
              <span className="text-[10px] font-mono">45° Optical Sensor</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                stopLiveCamera();
                onCancel();
              }}
              className="px-4 py-2.5 rounded border border-[var(--rule)] text-xs text-[var(--fg-soft)] hover:text-[var(--fg)] transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!selectedImage || isCameraActive}
              className="px-6 py-2.5 rounded-full bg-[var(--teal)] text-white font-medium text-xs sm:text-sm hover:opacity-95 disabled:opacity-40 transition-all shadow-sm cursor-pointer flex items-center gap-2 min-h-[44px] active:scale-[0.98]"
            >
              <span>PROCEED TO QUALITY GATE</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
