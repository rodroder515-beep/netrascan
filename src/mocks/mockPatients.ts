import { ScreeningAnalysisResult } from '../services/api';

export interface DemoScreeningSummary {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'F' | 'M' | 'Other';
  village: string;
  date: string;
  eye: 'OD' | 'OS';
  qualityStatus: 'GRADABLE' | 'UNGRADABLE';
  qualityScore: number;
  riskTier: 'NO_APPARENT_DR' | 'MILD_NONPROLIFERATIVE' | 'MODERATE_NONPROLIFERATIVE' | 'SEVERE_NONPROLIFERATIVE' | 'PROLIFERATIVE_DR' | 'UNGRADABLE';
  triageCategory: 'CLEAR' | 'REFER' | 'ESCALATE' | 'RETAKE_REQUIRED';
  timeframe: string;
  isFictionalDemo: true;
}

export const MOCK_STATS = {
  totalScreened: 128,
  referralsIndicated: 17,
  urgentEscalations: 6,
  ungradableRetake: 9,
  routineAnnual: 96,
};

export const RECENT_SCREENINGS: DemoScreeningSummary[] = [
  {
    id: 'NS-8842',
    patientId: 'PT-4091',
    name: 'Sunita Devi',
    age: 52,
    gender: 'F',
    village: 'Ramgarh Sub-centre',
    date: '2026-09-28',
    eye: 'OD',
    qualityStatus: 'GRADABLE',
    qualityScore: 92,
    riskTier: 'MODERATE_NONPROLIFERATIVE',
    triageCategory: 'REFER',
    timeframe: 'Within 3-4 weeks',
    isFictionalDemo: true,
  },
  {
    id: 'NS-8841',
    patientId: 'PT-4090',
    name: 'Rameshwar Lal',
    age: 63,
    gender: 'M',
    village: 'Kalyanpur PHC',
    date: '2026-09-28',
    eye: 'OS',
    qualityStatus: 'GRADABLE',
    qualityScore: 95,
    riskTier: 'NO_APPARENT_DR',
    triageCategory: 'CLEAR',
    timeframe: 'Routine 12 months',
    isFictionalDemo: true,
  },
  {
    id: 'NS-8840',
    patientId: 'PT-4089',
    name: 'Kamla Bai',
    age: 58,
    gender: 'F',
    village: 'Devigarh Sub-centre',
    date: '2026-09-27',
    eye: 'OD',
    qualityStatus: 'GRADABLE',
    qualityScore: 89,
    riskTier: 'SEVERE_NONPROLIFERATIVE',
    triageCategory: 'ESCALATE',
    timeframe: 'Urgent 1-2 weeks',
    isFictionalDemo: true,
  },
  {
    id: 'NS-8839',
    patientId: 'PT-4088',
    name: 'Babu Rao Patil',
    age: 67,
    gender: 'M',
    village: 'Pipariya Camp',
    date: '2026-09-27',
    eye: 'OS',
    qualityStatus: 'UNGRADABLE',
    qualityScore: 42,
    riskTier: 'UNGRADABLE',
    triageCategory: 'RETAKE_REQUIRED',
    timeframe: 'Immediate retake',
    isFictionalDemo: true,
  },
  {
    id: 'NS-8838',
    patientId: 'PT-4087',
    name: 'Amina Khatun',
    age: 49,
    gender: 'F',
    village: 'Ramgarh Sub-centre',
    date: '2026-09-26',
    eye: 'OD',
    qualityStatus: 'GRADABLE',
    qualityScore: 94,
    riskTier: 'NO_APPARENT_DR',
    triageCategory: 'CLEAR',
    timeframe: 'Routine 12 months',
    isFictionalDemo: true,
  },
  {
    id: 'NS-8837',
    patientId: 'PT-4086',
    name: 'Devraj Singh',
    age: 55,
    gender: 'M',
    village: 'Bhimnagar Ward 3',
    date: '2026-09-25',
    eye: 'OS',
    qualityStatus: 'GRADABLE',
    qualityScore: 91,
    riskTier: 'MILD_NONPROLIFERATIVE',
    triageCategory: 'REFER',
    timeframe: 'Within 6 months',
    isFictionalDemo: true,
  },
  {
    id: 'NS-8836',
    patientId: 'PT-4085',
    name: 'Sushila Sharma',
    age: 61,
    gender: 'F',
    village: 'Kalyanpur PHC',
    date: '2026-09-25',
    eye: 'OD',
    qualityStatus: 'GRADABLE',
    qualityScore: 96,
    riskTier: 'NO_APPARENT_DR',
    triageCategory: 'CLEAR',
    timeframe: 'Routine 12 months',
    isFictionalDemo: true,
  },
];

export const DEMO_PRESET_PATIENTS = [
  {
    label: 'Sunita Devi (Moderate DR Risk Indication · Referral)',
    imagePath: '/demo-fundus-dr.jpg',
    patient: {
      id: 'PT-4091',
      name: 'Sunita Devi',
      age: 52,
      gender: 'F' as const,
      village: 'Ramgarh Sub-centre',
      phone: '+91 98231 •••••',
      diabetesDurationYears: 9,
      randomBloodSugar: 210,
      hba1c: 8.8,
      eye: 'OD' as const,
      screeningDate: '2026-09-29',
    },
  },
  {
    label: 'Rameshwar Lal (No Apparent DR · Routine Clear)',
    imagePath: '/demo-fundus.jpg',
    patient: {
      id: 'PT-4090',
      name: 'Rameshwar Lal',
      age: 63,
      gender: 'M' as const,
      village: 'Kalyanpur PHC',
      phone: '+91 94112 •••••',
      diabetesDurationYears: 4,
      randomBloodSugar: 142,
      hba1c: 6.9,
      eye: 'OS' as const,
      screeningDate: '2026-09-29',
    },
  },
  {
    label: 'Babu Rao (Ungradable Haze · Quality Gate Trigger)',
    imagePath: '/demo-fundus.jpg?quality=ungradable',
    patient: {
      id: 'PT-4088',
      name: 'Babu Rao Patil',
      age: 67,
      gender: 'M' as const,
      village: 'Pipariya Camp',
      phone: '+91 97554 •••••',
      diabetesDurationYears: 12,
      randomBloodSugar: 245,
      hba1c: 9.4,
      eye: 'OS' as const,
      screeningDate: '2026-09-29',
    },
  },
];
