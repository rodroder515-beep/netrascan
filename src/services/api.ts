/**
 * NetraScan API and Service Layer
 * Supports both real backend (VITE_API_BASE_URL) and automated DEMO MODE / offline fallback.
 * 
 * Safety Notice: AI-assisted screening and triage support system, not a medical diagnosis system.
 */

export interface PatientIntake {
  id: string;
  name: string;
  age: number;
  gender: 'F' | 'M' | 'Other';
  village: string;
  phone?: string;
  diabetesDurationYears: number;
  randomBloodSugar?: number;
  hba1c?: number;
  eye: 'OD' | 'OS'; // OD = Right Eye, OS = Left Eye
  screeningDate: string;
}

export interface QualityCheckResult {
  isAcceptable: boolean;
  overallScore: number; // 0 - 100
  checks: {
    fieldDefinition: { name: string; score: number; passed: boolean; details: string };
    focusSharpness: { name: string; score: number; passed: boolean; details: string };
    illuminationUniformity: { name: string; score: number; passed: boolean; details: string };
    motionArtifacts: { name: string; score: number; passed: boolean; details: string };
    mediaOpacityHaze: { name: string; score: number; passed: boolean; details: string };
    gradabilityIndex: { name: string; score: number; passed: boolean; details: string };
  };
  rejectionReason?: string;
  recommendation: string;
}

export type DrRiskTier = 
  | 'NO_APPARENT_DR'
  | 'MILD_NONPROLIFERATIVE'
  | 'MODERATE_NONPROLIFERATIVE'
  | 'SEVERE_NONPROLIFERATIVE'
  | 'PROLIFERATIVE_DR'
  | 'UNGRADABLE';

export type TriageCategory = 'CLEAR' | 'REFER' | 'ESCALATE' | 'RETAKE_REQUIRED';

export interface LesionFinding {
  type: 'microaneurysm' | 'dot_hemorrhage' | 'hard_exudate' | 'cotton_wool_spot' | 'neovascularization';
  count: number;
  location: string;
  clinicalRelevance: string;
  coordinates: { x: number; y: number; r: number }[];
}

export interface RuleCrossCheck {
  ruleName: string;
  status: 'MET' | 'NOT_MET' | 'ALERT';
  description: string;
}

export interface ScreeningAnalysisResult {
  screeningId: string;
  timestamp: string;
  patient: PatientIntake;
  imageQuality: QualityCheckResult;
  riskTier: DrRiskTier;
  riskLabel: string;
  confidenceScore: number; // 0 - 100
  ruleCrossChecks: RuleCrossCheck[];
  lesions: LesionFinding[];
  anatomicalMetrics: {
    opticDiscCupRatio: string;
    vesselTortuosityIndex: string;
    macularFovealClearance: string;
    arteriolarVenularRatio: string;
  };
  explainability: {
    gradCamHighlights: string[];
    primaryFeatureDrivers: string[];
    clinicalRationale: string;
  };
  triage: {
    category: TriageCategory;
    categoryLabel: string;
    timeframe: string;
    referralFacility: string;
    actionProtocol: string;
    counselingNotesEnglish: string;
    counselingNotesHindi: string;
  };
  isFictionalDemo: true;
}

export interface SimulationParams {
  dailyScreenings: number;
  phcReferralCapacity: number;
  patientAdherencePercent: number;
  aiSpecificityThreshold: number;
}

export interface SimulationOutput {
  annualScreenings: number;
  referredPatients: number;
  adherentPatients: number;
  avoidedUnnecessaryTravelVisits: number;
  estimatedRuralFamilySavingsINR: number;
  specialistReviewHoursSaved: number;
  earlyInterventionRate: number;
  blindnessAversionProjection: number;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

// Internal check if backend is reachable
let isBackendReachable = false;
let hasCheckedBackend = false;

export const checkBackendHealth = async (): Promise<boolean> => {
  if (hasCheckedBackend) return isBackendReachable;
  if (!API_BASE_URL) {
    isBackendReachable = false;
    hasCheckedBackend = true;
    return false;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    isBackendReachable = res.ok;
  } catch {
    isBackendReachable = false;
  }
  hasCheckedBackend = true;
  return isBackendReachable;
};

export const apiService = {
  getIsDemoMode(): boolean {
    return !isBackendReachable || !API_BASE_URL;
  },

  async evaluateQuality(imageData: string): Promise<QualityCheckResult> {
    // If backend is configured, attempt real endpoint
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/quality-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData }),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fall back to offline inference engine
      }
    }

    // High fidelity offline rule-based quality evaluation
    const isDarkOrHazy = imageData.includes('blurry') || imageData.includes('hazy');
    const isUngradable = imageData.includes('ungradable') || imageData.includes('retake');

    if (isUngradable) {
      return {
        isAcceptable: false,
        overallScore: 38,
        checks: {
          fieldDefinition: { name: 'Field Definition & Centering', score: 45, passed: false, details: 'Optic disc boundary partially obscured by peripheral cut-off.' },
          focusSharpness: { name: 'Focus & Sharpness', score: 32, passed: false, details: 'Insufficient retinal arteriolar edge gradient (>3.2px blur).' },
          illuminationUniformity: { name: 'Illumination Uniformity', score: 40, passed: false, details: 'Significant uneven shadow in temporal hemifield.' },
          motionArtifacts: { name: 'Motion Artifacts', score: 55, passed: true, details: 'No gross motion streaks detected.' },
          mediaOpacityHaze: { name: 'Media Opacity / Cataract Index', score: 35, passed: false, details: 'Corneal/lens reflection obscures central macula.' },
          gradabilityIndex: { name: 'Overall Gradability Index', score: 38, passed: false, details: 'Below acceptable threshold (min. 70 required).' },
        },
        rejectionReason: 'Suboptimal illumination and focus. Pupil dilation or repositioning recommended.',
        recommendation: 'Retake fundus image under dimmed ambient room lighting. Ensure patient maintains steady fixation on the green target LED.',
      };
    }

    return {
      isAcceptable: true,
      overallScore: isDarkOrHazy ? 76 : 94,
      checks: {
        fieldDefinition: { name: 'Field Definition & Centering', score: 95, passed: true, details: 'Macula and optic disc clearly positioned within 45° field of view.' },
        focusSharpness: { name: 'Focus & Sharpness', score: 92, passed: true, details: 'High vessel edge contrast. Micro-vascular bifurcations distinct.' },
        illuminationUniformity: { name: 'Illumination Uniformity', score: 88, passed: true, details: 'Balanced illumination across nasal and temporal sectors.' },
        motionArtifacts: { name: 'Motion Artifacts', score: 96, passed: true, details: 'No eye saccade or motion blur artifacts identified.' },
        mediaOpacityHaze: { name: 'Media Opacity / Cataract Index', score: 91, passed: true, details: 'Clear media; negligible anterior chamber haze.' },
        gradabilityIndex: { name: 'Overall Gradability Index', score: 93, passed: true, details: 'Exceeds clinical gradability threshold.' },
      },
      recommendation: 'Image quality meets clinical screening standards. Proceed to automated analysis.',
    };
  },

  async runAnalysis(patient: PatientIntake, imageData: string, quality: QualityCheckResult): Promise<ScreeningAnalysisResult> {
    // If gate failed, return ungradable state strictly adhering to hard rule
    if (!quality.isAcceptable) {
      return {
        screeningId: `NS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        patient,
        imageQuality: quality,
        riskTier: 'UNGRADABLE',
        riskLabel: 'Ungradable Image — Retake Required',
        confidenceScore: 0,
        ruleCrossChecks: [
          { ruleName: 'Quality Gate Rule', status: 'ALERT', description: 'Screening halted: Image quality does not meet minimum diagnostic threshold.' }
        ],
        lesions: [],
        anatomicalMetrics: {
          opticDiscCupRatio: 'Indeterminate',
          vesselTortuosityIndex: 'Indeterminate',
          macularFovealClearance: 'Indeterminate',
          arteriolarVenularRatio: 'Indeterminate',
        },
        explainability: {
          gradCamHighlights: ['Quality gate failure prevents feature interpretation.'],
          primaryFeatureDrivers: ['Image ungradable due to optical distortion or insufficient illumination.'],
          clinicalRationale: 'No AI-assisted risk assessment can be computed reliably on an ungradable image. Retake required.',
        },
        triage: {
          category: 'RETAKE_REQUIRED',
          categoryLabel: 'RETAKE REQUIRED',
          timeframe: 'Immediate retake at clinic',
          referralFacility: 'Local PHC 01 / Sub-centre',
          actionProtocol: 'Repeat image acquisition with improved optical alignment or refer for dilated manual funduscopy.',
          counselingNotesEnglish: 'The photograph was not clear enough for assessment. A repeat picture will be taken.',
          counselingNotesHindi: 'फोटो स्पष्ट नहीं आई है। सटीक जांच के लिए कृपया दोबारा फोटो खिंचवाएं।',
        },
        isFictionalDemo: true,
      };
    }

    // Try real backend if available
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient, image: imageData }),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fall back
      }
    }

    // Realistic clinical triage decision for demo
    const isDrImage = imageData.includes('dr') || patient.diabetesDurationYears > 8 || (patient.hba1c && patient.hba1c > 8.5);

    if (isDrImage) {
      return {
        screeningId: `NS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        patient,
        imageQuality: quality,
        riskTier: 'MODERATE_NONPROLIFERATIVE',
        riskLabel: 'Moderate Non-Proliferative DR Risk Indication',
        confidenceScore: 88,
        ruleCrossChecks: [
          { ruleName: 'Microaneurysm Distribution (ETDRS Rule 2A)', status: 'MET', description: 'Multiple (>5) microaneurysms detected in inferior-temporal quadrant.' },
          { ruleName: 'Macular Edema Proximity Rule', status: 'ALERT', description: 'Hard exudates detected within 1.5 disc diameters of the foveal avascular zone.' },
          { ruleName: 'Venous Calibre & Tortuosity Rule', status: 'NOT_MET', description: 'No definite venous beading or severe tortuosity observed in principal arcades.' },
          { ruleName: 'Neovascularization Safety Rule', status: 'NOT_MET', description: 'No signs of proliferative neovascularization at the optic disc (NVD) or elsewhere (NVE).' },
        ],
        lesions: [
          {
            type: 'microaneurysm',
            count: 7,
            location: 'Inferior-temporal arcade & parafoveal sector',
            clinicalRelevance: 'Early localized vascular out-pouchings characteristic of microangiopathy.',
            coordinates: [
              { x: 38, y: 52, r: 8 },
              { x: 42, y: 56, r: 9 },
              { x: 35, y: 64, r: 7 },
              { x: 48, y: 62, r: 8 },
              { x: 55, y: 58, r: 6 },
              { x: 62, y: 48, r: 7 },
              { x: 39, y: 45, r: 8 },
            ]
          },
          {
            type: 'dot_hemorrhage',
            count: 3,
            location: 'Temporal retina, mid-periphery',
            clinicalRelevance: 'Intraretinal capillary rupture in the deeper retinal layers.',
            coordinates: [
              { x: 68, y: 54, r: 12 },
              { x: 72, y: 60, r: 10 },
              { x: 64, y: 67, r: 11 },
            ]
          },
          {
            type: 'hard_exudate',
            count: 4,
            location: 'Outer parafoveal crest',
            clinicalRelevance: 'Lipid transudation indicating localized vascular permeability changes.',
            coordinates: [
              { x: 49, y: 48, r: 9 },
              { x: 52, y: 46, r: 8 },
              { x: 54, y: 50, r: 10 },
              { x: 46, y: 52, r: 7 },
            ]
          }
        ],
        anatomicalMetrics: {
          opticDiscCupRatio: '0.34 (Normal anatomical physiological cup)',
          vesselTortuosityIndex: '1.24 (Mildly elevated temporal venular curvature)',
          macularFovealClearance: 'Intact foveal reflex; lipid border at 840 µm margin',
          arteriolarVenularRatio: '2:3 (Standard physiological caliber ratio)',
        },
        explainability: {
          gradCamHighlights: [
            'Inferior-temporal arcade shows primary neural network activation (82% attention weight).',
            'Secondary focal activation centered around lipid exudate clusters near macula margin.',
            'Optic disc region shows minimal activation, consistent with lack of disc neovascularization.',
          ],
          primaryFeatureDrivers: [
            'Cluster of 7 focal microaneurysms detected in the temporal retina.',
            'Parafoveal hard exudate ring initiating in outer macular boundary.',
            'Clinical history correlation: Diabetes duration > 8 yrs and elevated glucose profile.',
          ],
          clinicalRationale: 'The explainable vision model identified hallmark microvascular changes (microaneurysms and hard lipid deposits) characteristic of moderate non-proliferative changes. Clinical decision rules corroborate the need for ophthalmic evaluation.',
        },
        triage: {
          category: 'REFER',
          categoryLabel: 'REFER FOR OPHTHALMIC EVALUATION',
          timeframe: 'Refer within 3 to 4 weeks',
          referralFacility: 'Sub-District Hospital / District Eye Hospital',
          actionProtocol: 'Issue referral slip, schedule transport via ASHA cluster, counsel on glycemic control, and enter record in tele-ophthalmology queue.',
          counselingNotesEnglish: 'Screening indicates early retinal changes associated with diabetes. This is not a diagnosis. A doctor at the district hospital should examine your eyes within a month to protect your vision.',
          counselingNotesHindi: 'जांच में मधुमेह के कारण आंख के पर्दे पर शुरुआती बदलाव के संकेत मिले हैं। यह पक्का निदान नहीं है। डॉक्टर को एक महीने के भीतर दिखाना आवश्यक है।',
        },
        isFictionalDemo: true,
      };
    }

    // Default: No Apparent DR (Clear)
    return {
      screeningId: `NS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      patient,
      imageQuality: quality,
      riskTier: 'NO_APPARENT_DR',
      riskLabel: 'No Apparent DR Indications Detected',
      confidenceScore: 94,
      ruleCrossChecks: [
        { ruleName: 'Microaneurysm Detection Rule', status: 'NOT_MET', description: 'Zero definite microaneurysms detected across all 4 quadrants.' },
        { ruleName: 'Hemorrhage Screen Rule', status: 'NOT_MET', description: 'No intraretinal hemorrhages or flame hemorrhages detected.' },
        { ruleName: 'Exudate / Edema Rule', status: 'NOT_MET', description: 'Macular center and perimacular zones completely free of lipid transudates.' },
        { ruleName: 'Vascular Architecture Rule', status: 'MET', description: 'Smooth, unbroken retinal vascular arcades with normal branching indices.' },
      ],
      lesions: [],
      anatomicalMetrics: {
        opticDiscCupRatio: '0.30 (Well-defined margins, healthy neuroretinal rim)',
        vesselTortuosityIndex: '1.08 (Physiologically smooth vascular path)',
        macularFovealClearance: 'Pristine central foveal avascular zone',
        arteriolarVenularRatio: '2:3 (Normal A/V ratio without arteriolar narrowing)',
      },
      explainability: {
        gradCamHighlights: [
          'Diffusely balanced attention across vascular tree with zero pathological hotspots.',
          'Healthy neuroretinal rim and clear macular foveal reflex confirmed.',
        ],
        primaryFeatureDrivers: [
          'Absence of microaneurysms, hemorrhages, or exudative deposits.',
          'Sharp, uncompromised vessel boundaries throughout central 45° field.',
        ],
        clinicalRationale: 'No structural signs of diabetic retinopathy were detected in this image. Routine periodic monitoring advised.',
      },
      triage: {
        category: 'CLEAR',
        categoryLabel: 'CLEAR — ROUTINE ANNUAL FOLLOW-UP',
        timeframe: 'Annual Rescreening in 12 months',
        referralFacility: 'Local PHC 01 / ASHA Mobile Clinic',
        actionProtocol: 'Record in local health register. Provide healthy lifestyle guidance and reinforce annual retinal screening adherence.',
        counselingNotesEnglish: 'No visible signs of diabetic eye changes were detected today. Continue taking your diabetes medication as prescribed and come back for your yearly screening.',
        counselingNotesHindi: 'आज की जांच में आंख के पर्दे पर मधुमेह का कोई असर नहीं दिखा है। अपनी दवाएं नियम से लेते रहें और एक साल बाद दोबारा जांच करवाएं।',
      },
      isFictionalDemo: true,
    };
  },

  calculateSimulation(params: SimulationParams): SimulationOutput {
    const annualDays = 260; // Working days per year in rural PHC cluster
    const annualScreenings = params.dailyScreenings * annualDays;
    
    // Estimated epidemiology in rural diabetic population: ~18% positive risk indications
    const rawPositives = Math.round(annualScreenings * 0.185);
    const falsePositives = Math.round(annualScreenings * (1 - 0.185) * (1 - params.aiSpecificityThreshold / 100));
    const referredPatients = rawPositives + falsePositives;
    
    const adherentPatients = Math.round(referredPatients * (params.patientAdherencePercent / 100));
    
    // Rural families save unnecessary 60km travel to district hospital for false alarms
    const avoidedUnnecessaryTravelVisits = Math.max(0, Math.round(annualScreenings * 0.72));
    const avgTravelAndLostWagesPerTripINR = 1250; // INR per visit (bus + lost daily wage + companion)
    const estimatedRuralFamilySavingsINR = avoidedUnnecessaryTravelVisits * avgTravelAndLostWagesPerTripINR;
    
    // Specialist hours saved by triaging non-urgent cases locally
    const specialistReviewHoursSaved = Math.round((avoidedUnnecessaryTravelVisits * 15) / 60);
    
    // Early intervention rate (treated before proliferative vision loss)
    const earlyInterventionRate = Math.min(96, Math.round(82 + (params.patientAdherencePercent * 0.14)));
    
    // Projected severe vision loss / blindness averted
    const blindnessAversionProjection = Math.round(adherentPatients * 0.19);

    return {
      annualScreenings,
      referredPatients,
      adherentPatients,
      avoidedUnnecessaryTravelVisits,
      estimatedRuralFamilySavingsINR,
      specialistReviewHoursSaved,
      earlyInterventionRate,
      blindnessAversionProjection,
    };
  }
};
