export type UserRole = 'patient' | 'doctor' | 'admin';
export type RoleType = 'Patient' | 'Doctor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContacts?: EmergencyContact[];
  mfaEnabled?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isEmergencySharingEnabled?: boolean;
  abhaNumber?: string;
  abhaAddress?: string;
  abhaLinked?: boolean;
  abhaLinkedAt?: string;
  // Doctor specific profile fields
  registrationNumber?: string;
  medicalCouncil?: string;
  specialty?: string;
  qualification?: string;
  hospitalAffiliation?: string;
  experienceYears?: number;
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  canSwitchRole?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface ActiveMedicine {
  id: string;
  name: string;
  salt: string;
  dosage: string;
  frequency: string; // e.g. "Twice daily after meals"
  duration: string;
  startDate: string;
  endDate?: string;
  doctorName?: string;
  instructions?: string;
  remainingDoses: number;
  totalDoses: number;
  refillRequired?: boolean;
  prescribedFor?: string;
}

export interface ExtractedMedicineItem {
  id?: string;
  name: string;
  brandName?: string;
  activeIngredient?: string;
  salt?: string; // alias for activeIngredient
  strength?: string;
  dosage?: string; // alias for strength
  dosageForm?: string;
  quantity?: string;
  frequency: string;
  duration: string;
  instructions?: string;
  doctorNotes?: string;
  status: 'Prescribed medicine' | 'Possible medicine match';
  confidence: 'High' | 'Needs Confirmation' | 'Low Clarity';
  isUnclear: boolean;
  unclearReason?: string;
}

export interface ScannedPrescriptionResult {
  id: string;
  medicines: ExtractedMedicineItem[];
  doctorName: string;
  hospitalName: string;
  date: string;
  rawNotes?: string;
  potentialRisks?: string[];
  scannedAt: string;
  imageUrl?: string;
}

export interface PharmacyListing {
  pharmacyId: string;
  pharmacyName: string;
  pharmacyType: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  openStatus: string;
  distanceKm: number;
  brandName: string;
  packSize: number;
  packPrice: number | null;
  pricePerUnit: number | null;
  availability: 'Available' | 'Out of Stock' | 'Availability not verified';
  verifiedTimestamp: string | null;
  isVerifiedPrice: boolean;
}

export interface MedicinePharmacyComparison {
  medicineName: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  quantity: string;
  bestVerifiedOption: {
    pricePerUnit: number;
    packPrice: number;
    packSize: number;
    brandName: string;
    pharmacyName: string;
    address: string;
    distanceKm: number;
    verifiedTimestamp: string;
    lat: number;
    lng: number;
    phone?: string;
  } | null;
  allPharmacies: PharmacyListing[];
}

export interface CompletePrescriptionStore {
  pharmacyId: string;
  pharmacyName: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  distanceKm: number;
  totalPrescriptionPrice: number;
  verifiedTimestamp: string;
  hasAllMedicines: boolean;
}

export interface MedicineDetail {
  id: string;
  name: string;
  saltComposition: string;
  category: string;
  uses: string[];
  sideEffects: string[];
  drugInteractions: string[];
  foodInteractions: string[];
  pregnancyWarning: string;
  allergyWarning: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  genericAlternatives: {
    name: string;
    manufacturer: string;
    price: number;
  }[];
  brandPrice: number;
  availabilityStatus: 'In Stock' | 'Limited Stock' | 'Out of Stock';
  prescriptionRequired: boolean;
}

export interface MedicineUsageLog {
  id: string;
  medicineName: string;
  takenAt: string;
  status: 'taken' | 'missed' | 'snoozed';
  notes?: string;
}

export interface HealthMetricLog {
  id: string;
  timestamp: string;
  systolicBp?: number;
  diastolicBp?: number;
  bloodSugar?: number; // mg/dL
  weight?: number; // kg
  temperature?: number; // °F
  sleepHours?: number;
  mood?: 'Great' | 'Good' | 'Neutral' | 'Poor' | 'Severe';
  painLevel?: number; // 1-10
  symptoms?: string[];
  notes?: string;
}

export interface HealthProgressAnalysisResult {
  recoveryScore: number;
  healthStatusSummary: string;
  trendAnalysis: string[];
  improvements: string[];
  concerns: string[];
  consultationRecommendation: string;
  lifestyleTips: string[];
}

export type DoctorVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
export type DoctorOnlineStatus = 'online' | 'offline' | 'busy';

export interface DoctorWorkingSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Doctor {
  id: string;
  userId?: string;
  name: string;
  photoUrl?: string; // Uploaded doctor photo URL from Supabase Storage
  avatarUrl?: string; // Fallback or legacy
  specialty: string;
  qualification: string;
  registrationNumber: string; // Medical Council Registration Number
  registrationAuthority: string; // e.g. "Uttar Pradesh Medical Council"
  experienceYears: number;
  languages: string[]; // Spoken languages e.g. ['Hindi', 'English', 'Urdu']
  country: string; // e.g. 'India'
  state: string; // e.g. 'Uttar Pradesh'
  city: string; // e.g. 'Lucknow'
  hospital: string; // Hospital/clinic affiliation
  address: string; // Practice address
  fees: number;
  consultationTypes: ('In-Person' | 'Audio' | 'Video')[];
  about: string; // Professional bio
  verificationStatus: DoctorVerificationStatus;
  verified: boolean; // boolean alias for verificationStatus === 'VERIFIED'
  onlineStatus: DoctorOnlineStatus;
  availableDays: string[];
  availableSlots: string[];
  workingSchedule?: DoctorWorkingSlot[];
  consultationDurationMins?: number;
  createdAt?: string;
  lastActiveAt?: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  rating?: number; // Only from real reviews if present, default 0
  reviewsCount?: number; // Real reviews count
}

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'UPCOMING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  patientId?: string;
  date: string;
  timeSlot: string;
  type: 'In-Person' | 'Audio' | 'Video';
  status: AppointmentStatus;
  fees: number;
  notes?: string;
  prescriptionsShared?: string[];
  createdAt?: string;
}

export interface ConsultationMessage {
  id: string;
  sender: 'doctor' | 'patient' | 'system';
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface NearbyFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Pharmacy' | 'Blood Bank' | 'Diagnostic Lab' | 'Ambulance';
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm: number;
  openStatus: string;
  emergencyBedsAvailable?: number;
  bloodStock?: Record<string, 'Available' | 'Low' | 'Out of Stock'>;
  rating: number;
}

export type RumorClassification = 'True' | 'False' | 'Misleading' | 'Partially True';

export interface FactCheckResult {
  id: string;
  claim: string;
  classification: RumorClassification;
  explanation: string;
  keyTakeaways: string[];
  trustedReferences: { title: string; url: string }[];
  safeGuidance: string;
  checkedAt: string;
}

export interface HealthAssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  imageUrl?: string;
  audioUrl?: string;
  hasRedFlags?: boolean;
}

export interface HomeCareGuide {
  id: string;
  condition: string;
  symptoms: string[];
  homeCareOptions: string[];
  whenToConsultDoctor: string[];
  emergencyWarningSigns: string[];
  category: string;
}

export interface VaultItem {
  id: string;
  title: string;
  category: 'Prescription' | 'Doctor Note' | 'Lab Report' | 'X-Ray / Scan' | 'ECG' | 'Vaccination' | 'Insurance' | 'Bill' | 'Allergy Record' | 'Discharge Summary';
  doctorName?: string;
  diseaseOrTag?: string;
  date: string;
  fileSize: string;
  fileType: 'pdf' | 'jpg' | 'png' | 'doc';
  fileUrl?: string;
  notes?: string;
  sharedLink?: string;
  sharedExpiry?: string;
  isImportant?: boolean;
}

export interface HealthTimelineEvent {
  id: string;
  date: string;
  title: string;
  type: 'diagnosis' | 'medication' | 'surgery' | 'lab_test' | 'vaccination' | 'doctor_visit';
  description: string;
  doctorOrHospital?: string;
  relatedVaultItemId?: string;
}

export interface RiskAlert {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
  affectedMedicines?: string[];
  detectedAt: string;
}

export interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  times: string[]; // e.g. ["08:00", "20:00"]
  isActive: boolean;
  daysOfWeek: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  instructions?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'reminder' | 'report' | 'emergency' | 'insight';
  timestamp: string;
  read: boolean;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  type: 'SOAP Note' | 'Progress Note' | 'Discharge Summary' | 'Pre-Op Evaluation';
  subjective: string; // Patient symptoms & complaints
  objective: string;   // Vitals & physical examination
  assessment: string;  // Diagnosis / Clinical impressions
  plan: string;        // Medication, tests, follow-up
  vitals?: {
    bp?: string;
    pulse?: number;
    temp?: number;
    spO2?: number;
  };
  doctorSignature: string;
  isLocked: boolean;
}

export interface DoctorPatientMessage {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  senderRole: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentTitle?: string;
  isUrgent?: boolean;
}

export interface PatientSummaryForDoctor {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  allergies: string[];
  chronicConditions: string[];
  abhaNumber?: string;
  lastVisitDate?: string;
  recentVitalsSummary?: string;
  activeMedCount: number;
  vaultDocCount: number;
}

// ============================================================================
// BLOOD DONATION NETWORK TYPES
// ============================================================================

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type ContactMethod = 'Email' | 'Phone' | 'Both';
export type AvailabilityStatus = 'Available' | 'Emergency Only' | 'Currently Unavailable';

export interface BloodDonor {
  id: string;
  user_id: string;
  fullName: string;
  email: string;
  phone?: string;
  bloodGroup: BloodGroup;
  city: string;
  state: string;
  country: string;
  preferredContactMethod: ContactMethod;
  availability: AvailabilityStatus;
  lastDonationDate?: string;
  consentGiven: boolean;
  consentGivenAt: string;
  notificationsPaused: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VerifiedBloodOrganization {
  id: string;
  name: string;
  orgType: 'Hospital' | 'Red Cross' | 'Government Blood Bank' | 'Registered NGO';
  verificationStatus: 'VERIFIED' | 'PENDING';
  city: string;
  state: string;
  country: string;
  officialWebsite?: string;
  contactEmail?: string;
  requirements?: string;
  supportedBloodGroups: BloodGroup[];
}

export interface BloodRequest {
  id: string;
  orgId: string;
  orgName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  urgency: 'CRITICAL' | 'URGENT' | 'STANDARD';
  hospitalName: string;
  city: string;
  state: string;
  contactEmail: string;
  additionalInstructions?: string;
  createdAt: string;
  status: 'OPEN' | 'FULFILLED' | 'EXPIRED';
}

export interface DonorRequestMatch {
  id: string;
  requestId: string;
  donorId: string;
  status: 'NOTIFIED' | 'RESPONDED_YES' | 'RESPONDED_NO';
  notifiedAt: string;
  respondedAt?: string;
}


