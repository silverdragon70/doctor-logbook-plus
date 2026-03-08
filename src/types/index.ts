// ─── Patient ───────────────────────────────────────────────
export interface Patient {
  patientId: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  caseCount: number;
  lastVisit: string;
  specialty: string;
  dateAdded: string;
  status: 'active' | 'discharged';
  createdAt: string;
  updatedAt: string;
  fileNumber?: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
}

// ─── Case ──────────────────────────────────────────────────
export interface Case {
  caseId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female';
  date: string;
  fileNumber: string;
  hospital: string;
  hospitalId?: string;
  dob: { day: string; month: string; year: string };
  admissionDate: string;
  specialty: string;
  provisionalDiagnosis: string;
  finalDiagnosis?: string;
  chiefComplaint: string;
  historyComplaint: string;
  presentHistory: string;
  pastMedicalHistory: string;
  allergies: string;
  currentMedications: string;
  mediaCount: number;
  lastModified: number;
  status: 'active' | 'discharged';
  dischargeDate?: string;
  dischargeOutcome?: string;
  dischargeNotes?: string;
}

// ─── Investigation ─────────────────────────────────────────
export interface Investigation {
  id: string;
  caseId: string;
  name: string;
  type: 'Lab Result' | 'Imaging' | 'Other';
  date: string;
  result: string;
  images: string[];
}

// ─── Management ────────────────────────────────────────────
export interface MedicationEntry {
  id: string;
  caseId: string;
  type: 'Medications';
  date: string;
  medications: string[];
  chartImage?: string;
}
export interface RespiratoryEntry {
  id: string;
  caseId: string;
  type: 'Respiratory Support';
  date: string;
  mode: string;
  details: string;
}
export interface FeedingEntry {
  id: string;
  caseId: string;
  type: 'Feeding';
  date: string;
  mode: string;
  details: string;
}
export type ManagementEntry = MedicationEntry | RespiratoryEntry | FeedingEntry;

// ─── Progress Note ─────────────────────────────────────────
export interface VitalSigns {
  hr: string;
  spo2: string;
  temp: string;
  rr: string;
  bp: string;
  weight: string;
  dateTime: string;
}
export interface ProgressNote {
  id: string;
  caseId: string;
  date: string;
  assessment: string;
  vitals: VitalSigns;
}

// ─── Procedure ─────────────────────────────────────────────
export interface Procedure {
  id: string;
  name: string;
  date: string;
  participation: 'Performed' | 'Assisted' | 'Observed';
  patientName?: string;
  hospital?: string;
  supervisor?: string;
  location?: string;
  indication?: string;
  notes?: string;
}

// ─── Lecture ───────────────────────────────────────────────
export interface Lecture {
  id: string;
  topic: string;
  date: string;
  speaker?: string;
  duration?: string;
  location?: string;
  notes?: string;
}

// ─── Course ────────────────────────────────────────────────
export interface Course {
  id: string;
  name: string;
  date: string;
  provider?: string;
  duration?: string;
  hasCertificate: boolean;
  certificatePath?: string;
  notes?: string;
}

// ─── Hospital ──────────────────────────────────────────────
export interface Hospital {
  id: string;
  name: string;
  department?: string;
  unit?: string;
  location?: string;
  position?: 'intern' | 'resident' | 'registrar' | 'specialist';
  startDate?: string;
}

// ─── Settings ──────────────────────────────────────────────
export interface AppSettings {
  themeColor: string;
  darkMode: boolean;
  fontSize: string;
  dateFormat: string;
  defaultHospitalId: string;
  aiProvider: string;
  apiKey: string;
  aiModel: string;
  aiLanguage: string;
  aiFeatures: boolean;
  syncEnabled: boolean;
  syncFrequency: string;
  encryptedBackup: boolean;
  pinLock: boolean;
  biometric: boolean;
  confirmDialogs: boolean;
  autoSave: boolean;
  imageQuality: string;
  imageMaxSize: string;
}

// ─── AI ────────────────────────────────────────────────────
export interface DeIdentifiedCase {
  token: string;
  age: number;
  gender: 'male' | 'female';
  specialty: string;
  provisionalDiagnosis: string;
  chiefComplaint: string;
  presentHistory: string;
  pastMedicalHistory: string;
  allergies: string;
  currentMedications: string;
  investigations: {
    name: string; type: string; result: string; relativeDate: string;
  }[];
  management: {
    type: string; medications?: string[]; mode?: string;
    details?: string; relativeDate: string;
  }[];
  progressNotes: {
    assessment: string; vitals: VitalSigns; relativeDate: string;
  }[];
  status: 'active' | 'discharged';
  dischargeOutcome?: string;
}

export interface SyncQueueItem {
  id: string;
  tableName: string;
  recordId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload?: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
  retryCount: number;
}

export interface BackupMetadata {
  appVersion: string;
  date: string;
  backupType: string;
  size: string;
  destination: string;
}

export interface GoogleAccount {
  id: string;
  email: string;
  active: boolean;
}
