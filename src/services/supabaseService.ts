import { supabase, isSupabaseConfigured, SUPABASE_STORAGE_BUCKETS } from '../lib/supabase';
import {
  UserProfile,
  ActiveMedicine,
  VaultItem,
  Appointment,
  HealthMetricLog,
  Reminder,
  HealthAssistantMessage,
  UserRole,
  Doctor,
  DoctorVerificationStatus,
  DoctorOnlineStatus,
  BloodDonor,
  VerifiedBloodOrganization,
  BloodRequest,
  BloodGroup,
  AvailabilityStatus
} from '../types';
import { initialDoctors } from '../data/initialData';
import { auditLogger } from './AuditLogger';

// Local storage backup keys for offline / disconnected operation
const STORAGE_KEYS = {
  PROFILE: 'jeevancare_supabase_profile_cache',
  MEDICINES: 'jeevancare_supabase_medicines_cache',
  VAULT: 'jeevancare_supabase_vault_cache',
  APPOINTMENTS: 'jeevancare_supabase_appointments_cache',
  METRICS: 'jeevancare_supabase_metrics_cache',
  REMINDERS: 'jeevancare_supabase_reminders_cache',
  DOCTORS: 'jeevancare_supabase_doctors_cache',
  BLOOD_DONOR: 'jeevancare_supabase_blood_donor_cache',
  BLOOD_REQUESTS: 'jeevancare_supabase_blood_requests_cache',
  BLOOD_ORGS: 'jeevancare_supabase_blood_orgs_cache',
};

// ============================================================================
// 1. AUTHENTICATION SERVICES
// ============================================================================

export const supabaseAuth = {
  async signUp(email: string, pass: string, name: string, role: UserRole = 'patient') {
    if (!isSupabaseConfigured) {
      return { user: { id: `u_${Date.now()}`, email, name, role }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { name, role },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create matching database profile
        await supabaseProfile.upsertProfile({
          id: data.user.id,
          name,
          email,
          role,
          bloodGroup: 'O+',
          allergies: [],
          chronicConditions: [],
          isEmergencySharingEnabled: true,
        });

        auditLogger.logAction(
          'USER_SIGNUP',
          `Created new Supabase account for ${email} with role ${role}.`,
          { id: data.user.id, name: email, role },
          'SUCCESS'
        );
      }

      return { user: data.user, error: null };
    } catch (err: any) {
      console.warn('Supabase Auth SignUp Error:', err.message);
      return { user: null, error: err.message || 'Failed to sign up.' };
    }
  },

  async signIn(email: string, pass: string) {
    if (!isSupabaseConfigured) {
      return { user: { id: 'u1', email, name: 'Aarav Sharma', role: 'patient' }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw error;

      auditLogger.logAction(
        'USER_LOGIN',
        `Supabase authentication successful for ${email}.`,
        { id: data.user?.id, name: email },
        'SUCCESS'
      );

      return { user: data.user, session: data.session, error: null };
    } catch (err: any) {
      console.warn('Supabase Auth SignIn Error:', err.message);
      return { user: null, session: null, error: err.message || 'Invalid login credentials.' };
    }
  },

  async signOut() {
    if (!isSupabaseConfigured) return { error: null };
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      auditLogger.logAction('USER_LOGOUT', 'User signed out from Supabase Auth.', {}, 'SUCCESS');
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  async getCurrentSession() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  },

  async resetPasswordForEmail(email: string) {
    if (!isSupabaseConfigured) {
      return { message: `Demo password reset link dispatched to ${email}`, error: null };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#reset-password`,
      });
      if (error) throw error;
      auditLogger.logAction(
        'PASSWORD_RESET_REQUESTED',
        `Password reset email sent to ${email}.`,
        { name: email },
        'SUCCESS'
      );
      return { message: `Password reset link sent to ${email}. Please check your inbox.`, error: null };
    } catch (err: any) {
      return { message: null, error: err.message || 'Failed to send password reset link.' };
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },
};

// ============================================================================
// 2. USER PROFILE SERVICES
// ============================================================================

export const supabaseProfile = {
  async fetchProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) {
      const cached = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return cached ? JSON.parse(cached) : null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const formatted: UserProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          age: data.age,
          gender: data.gender,
          bloodGroup: data.blood_group,
          allergies: data.allergies || [],
          chronicConditions: data.chronic_conditions || [],
          emergencyContactName: data.emergency_contact_name,
          emergencyContactPhone: data.emergency_contact_phone,
          isEmergencySharingEnabled: data.is_emergency_sharing_enabled ?? true,
          abhaNumber: data.abha_number,
          abhaAddress: data.abha_address,
          abhaLinked: data.abha_linked ?? false,
        };
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(formatted));
        return formatted;
      }
      return null;
    } catch (err) {
      console.warn('Supabase profile fetch error, using local cache:', err);
      const cached = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return cached ? JSON.parse(cached) : null;
    }
  },

  async upsertProfile(profile: UserProfile): Promise<boolean> {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));

    if (!isSupabaseConfigured) return true;

    try {
      const dbRow = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone || null,
        age: profile.age || null,
        gender: profile.gender || null,
        blood_group: profile.bloodGroup || null,
        allergies: profile.allergies || [],
        chronic_conditions: profile.chronicConditions || [],
        emergency_contact_name: profile.emergencyContactName || null,
        emergency_contact_phone: profile.emergencyContactPhone || null,
        is_emergency_sharing_enabled: profile.isEmergencySharingEnabled ?? true,
        abha_number: profile.abhaNumber || null,
        abha_address: profile.abhaAddress || null,
        abha_linked: profile.abhaLinked ?? false,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(dbRow);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase profile upsert error:', err);
      return false;
    }
  },
};

// ============================================================================
// 3. MEDICINES SERVICES
// ============================================================================

export const supabaseMedicines = {
  async fetchActiveMedicines(userId: string): Promise<ActiveMedicine[]> {
    if (!isSupabaseConfigured) {
      const cached = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      return cached ? JSON.parse(cached) : [];
    }

    try {
      const { data, error } = await supabase
        .from('active_medicines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const meds: ActiveMedicine[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          salt: d.salt,
          dosage: d.dosage,
          frequency: d.frequency,
          duration: d.duration,
          startDate: d.start_date,
          endDate: d.end_date,
          doctorName: d.doctor_name,
          instructions: d.instructions,
          remainingDoses: d.remaining_doses,
          totalDoses: d.total_doses,
          refillRequired: d.refill_required,
          prescribedFor: d.prescribed_for,
        }));
        localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(meds));
        return meds;
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch medicines from Supabase:', err);
      const cached = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      return cached ? JSON.parse(cached) : [];
    }
  },

  async addMedicine(userId: string, med: ActiveMedicine): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase.from('active_medicines').insert({
        user_id: userId,
        name: med.name,
        salt: med.salt,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        start_date: med.startDate,
        doctor_name: med.doctorName,
        instructions: med.instructions,
        remaining_doses: med.remainingDoses,
        total_doses: med.totalDoses,
        prescribed_for: med.prescribedFor,
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to add medicine to Supabase:', err);
      return false;
    }
  },
};

// ============================================================================
// 4. MEDICAL VAULT & STORAGE SERVICES
// ============================================================================

export const supabaseVault = {
  async fetchVaultItems(userId: string): Promise<VaultItem[]> {
    if (!isSupabaseConfigured) {
      const cached = localStorage.getItem(STORAGE_KEYS.VAULT);
      return cached ? JSON.parse(cached) : [];
    }

    try {
      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const items: VaultItem[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          doctorName: d.doctor_name,
          diseaseOrTag: d.disease_or_tag,
          date: d.date,
          fileSize: d.file_size,
          fileType: d.file_type,
          fileUrl: d.file_url,
          notes: d.notes,
          sharedLink: d.shared_link,
          sharedExpiry: d.shared_expiry,
          isImportant: d.is_important,
        }));
        localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(items));
        return items;
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch vault items from Supabase:', err);
      const cached = localStorage.getItem(STORAGE_KEYS.VAULT);
      return cached ? JSON.parse(cached) : [];
    }
  },

  async addVaultItem(userId: string, item: VaultItem): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase.from('vault_items').insert({
        user_id: userId,
        title: item.title,
        category: item.category,
        doctor_name: item.doctorName,
        disease_or_tag: item.diseaseOrTag,
        date: item.date,
        file_size: item.fileSize,
        file_type: item.fileType,
        file_url: item.fileUrl,
        notes: item.notes,
        shared_link: item.sharedLink,
        is_important: item.isImportant ?? false,
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to add vault item to Supabase:', err);
      return false;
    }
  },

  async deleteVaultItem(userId: string, itemId: string): Promise<boolean> {
    const cached = localStorage.getItem(STORAGE_KEYS.VAULT);
    if (cached) {
      const parsed: VaultItem[] = JSON.parse(cached);
      const filtered = parsed.filter((i) => i.id !== itemId);
      localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(filtered));
    }

    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase
        .from('vault_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to delete vault item from Supabase:', err);
      return false;
    }
  },

  async uploadDocumentToStorage(userId: string, file: File): Promise<string | null> {
    if (!isSupabaseConfigured) {
      // Create data URL fallback for local testing
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    try {
      const filePath = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKETS.MEDICAL_DOCUMENTS)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      // Get public or signed URL
      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_STORAGE_BUCKETS.MEDICAL_DOCUMENTS)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Supabase Storage upload error:', err);
      return null;
    }
  },
};

// ============================================================================
// 5. APPOINTMENTS SERVICES
// ============================================================================

export const supabaseAppointments = {
  async fetchAppointments(userId: string): Promise<Appointment[]> {
    if (!isSupabaseConfigured) {
      const cached = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return cached ? JSON.parse(cached) : [];
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const apps: Appointment[] = data.map((d: any) => ({
          id: d.id,
          doctorId: d.doctor_id,
          doctorName: d.doctor_name,
          specialty: d.specialty,
          patientName: d.patient_name,
          date: d.date,
          timeSlot: d.time_slot,
          type: d.type,
          status: d.status,
          fees: d.fees,
          notes: d.notes,
          prescriptionsShared: d.prescriptions_shared || [],
        }));
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(apps));
        return apps;
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch appointments from Supabase:', err);
      const cached = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return cached ? JSON.parse(cached) : [];
    }
  },

  async createAppointment(userId: string, app: Appointment): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase.from('appointments').insert({
        user_id: userId,
        doctor_id: app.doctorId,
        doctor_name: app.doctorName,
        specialty: app.specialty,
        patient_name: app.patientName,
        date: app.date,
        time_slot: app.timeSlot,
        type: app.type,
        status: app.status || 'Upcoming',
        fees: app.fees,
        notes: app.notes,
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to create appointment in Supabase:', err);
      return false;
    }
  },
};

// ============================================================================
// 6. HEALTH METRICS LOGS SERVICES
// ============================================================================

export const supabaseHealthMetrics = {
  async fetchMetricLogs(userId: string): Promise<HealthMetricLog[]> {
    if (!isSupabaseConfigured) {
      const cached = localStorage.getItem(STORAGE_KEYS.METRICS);
      return cached ? JSON.parse(cached) : [];
    }

    try {
      const { data, error } = await supabase
        .from('health_metric_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const logs: HealthMetricLog[] = data.map((d: any) => ({
          id: d.id,
          timestamp: d.timestamp,
          systolicBp: d.systolic_bp,
          diastolicBp: d.diastolic_bp,
          bloodSugar: d.blood_sugar,
          weight: d.weight,
          temperature: d.temperature,
          sleepHours: d.sleep_hours,
          mood: d.mood,
          painLevel: d.pain_level,
          symptoms: d.symptoms || [],
          notes: d.notes,
        }));
        localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(logs));
        return logs;
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch metric logs from Supabase:', err);
      const cached = localStorage.getItem(STORAGE_KEYS.METRICS);
      return cached ? JSON.parse(cached) : [];
    }
  },

  async addMetricLog(userId: string, log: HealthMetricLog): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase.from('health_metric_logs').insert({
        user_id: userId,
        systolic_bp: log.systolicBp,
        diastolic_bp: log.diastolicBp,
        blood_sugar: log.bloodSugar,
        weight: log.weight,
        temperature: log.temperature,
        sleep_hours: log.sleepHours,
        mood: log.mood,
        pain_level: log.painLevel,
        symptoms: log.symptoms || [],
        notes: log.notes,
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to add health metric log to Supabase:', err);
      return false;
    }
  },
};

// ============================================================================
// 7. REAL DOCTOR DATABASE & VERIFICATION SERVICES
// ============================================================================

export const supabaseDoctors = {
  async fetchDoctors(): Promise<Doctor[]> {
    if (!isSupabaseConfigured) {
      const cached = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // fallback
        }
      }
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(initialDoctors));
      return initialDoctors;
    }

    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const doctors: Doctor[] = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          name: d.name,
          photoUrl: d.photo_url || undefined,
          avatarUrl: d.avatar_url || undefined,
          specialty: d.specialty,
          qualification: d.qualification,
          registrationNumber: d.registration_number,
          registrationAuthority: d.registration_authority,
          experienceYears: d.experience_years || 0,
          languages: Array.isArray(d.languages) ? d.languages : (d.languages ? JSON.parse(d.languages) : ['English', 'Hindi']),
          country: d.country || 'India',
          state: d.state || 'Uttar Pradesh',
          city: d.city || 'Lucknow',
          hospital: d.hospital || '',
          address: d.address || '',
          fees: d.fees || 500,
          consultationTypes: Array.isArray(d.consultation_types) ? d.consultation_types : ['Video', 'In-Person'],
          about: d.about || '',
          verificationStatus: (d.verification_status as DoctorVerificationStatus) || 'PENDING',
          verified: d.verification_status === 'VERIFIED',
          onlineStatus: (d.online_status as DoctorOnlineStatus) || 'online',
          availableDays: Array.isArray(d.available_days) ? d.available_days : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          availableSlots: Array.isArray(d.available_slots) ? d.available_slots : ['09:30 AM', '11:00 AM', '02:30 PM', '04:15 PM'],
          consultationDurationMins: d.consultation_duration_mins || 20,
          createdAt: d.created_at,
          lastActiveAt: d.last_active_at,
          lat: d.lat,
          lng: d.lng,
          distanceKm: d.distance_km || 2.0,
          rating: d.rating || 0,
          reviewsCount: d.reviews_count || 0,
        }));

        localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
        return doctors;
      }

      // If database returns 0 rows, use cached initial verified doctors
      const cached = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      const fallback = cached ? JSON.parse(cached) : initialDoctors;
      return fallback;
    } catch (err) {
      console.warn('Failed to fetch doctors from Supabase, using cached records:', err);
      const cached = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      return cached ? JSON.parse(cached) : initialDoctors;
    }
  },

  async registerDoctor(newDoctor: Omit<Doctor, 'id'> & { id?: string }): Promise<Doctor> {
    const docId = newDoctor.id || `doc_${Date.now()}`;
    const fullDoc: Doctor = {
      ...newDoctor,
      id: docId,
      verificationStatus: 'PENDING',
      verified: false,
      onlineStatus: newDoctor.onlineStatus || 'online',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      rating: 0,
      reviewsCount: 0,
    };

    // Update local cache
    const current = await this.fetchDoctors();
    const updated = [fullDoc, ...current.filter((d) => d.id !== docId)];
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(updated));

    if (!isSupabaseConfigured) return fullDoc;

    try {
      const { error } = await supabase.from('doctors').upsert({
        id: fullDoc.id,
        user_id: fullDoc.userId || null,
        name: fullDoc.name,
        photo_url: fullDoc.photoUrl || null,
        specialty: fullDoc.specialty,
        qualification: fullDoc.qualification,
        registration_number: fullDoc.registrationNumber,
        registration_authority: fullDoc.registrationAuthority,
        experience_years: fullDoc.experienceYears,
        languages: fullDoc.languages,
        country: fullDoc.country,
        state: fullDoc.state,
        city: fullDoc.city,
        hospital: fullDoc.hospital,
        address: fullDoc.address,
        fees: fullDoc.fees,
        consultation_types: fullDoc.consultationTypes,
        about: fullDoc.about,
        verification_status: fullDoc.verificationStatus,
        online_status: fullDoc.onlineStatus,
        available_days: fullDoc.availableDays,
        available_slots: fullDoc.availableSlots,
        consultation_duration_mins: fullDoc.consultationDurationMins || 20,
        lat: fullDoc.lat || null,
        lng: fullDoc.lng || null,
      });

      if (error) console.warn('Supabase doctor registration error:', error.message);
    } catch (err) {
      console.warn('Failed to register doctor in Supabase:', err);
    }

    return fullDoc;
  },

  async updateDoctorVerification(doctorId: string, status: DoctorVerificationStatus): Promise<boolean> {
    const cached = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    if (cached) {
      try {
        const parsed: Doctor[] = JSON.parse(cached);
        const updated = parsed.map((d) =>
          d.id === doctorId
            ? { ...d, verificationStatus: status, verified: status === 'VERIFIED' }
            : d
        );
        localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(updated));
      } catch (err) {
        console.warn('Cache update error:', err);
      }
    }

    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          verification_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', doctorId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to update doctor verification in Supabase:', err);
      return false;
    }
  },

  async updateDoctorOnlineStatus(doctorId: string, status: DoctorOnlineStatus): Promise<boolean> {
    const cached = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    if (cached) {
      try {
        const parsed: Doctor[] = JSON.parse(cached);
        const updated = parsed.map((d) =>
          d.id === doctorId ? { ...d, onlineStatus: status, lastActiveAt: new Date().toISOString() } : d
        );
        localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(updated));
      } catch (err) {
        console.warn('Cache update error:', err);
      }
    }

    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          online_status: status,
          last_active_at: new Date().toISOString(),
        })
        .eq('id', doctorId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to update doctor online status in Supabase:', err);
      return false;
    }
  },

  async uploadProfilePhoto(doctorId: string, file: File): Promise<string | null> {
    if (!isSupabaseConfigured) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    try {
      const filePath = `doctors/${doctorId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const bucketName = SUPABASE_STORAGE_BUCKETS.AVATARS || 'doctor-photos';

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Doctor photo upload error:', err);
      return null;
    }
  },
};

// ============================================================================
// 8. BLOOD DONATION NETWORK SERVICES
// ============================================================================

export const supabaseBloodDonation = {
  async fetchDonorProfile(userId: string): Promise<BloodDonor | null> {
    const cached = localStorage.getItem(STORAGE_KEYS.BLOOD_DONOR);
    if (cached) {
      try {
        const parsed: BloodDonor = JSON.parse(cached);
        if (parsed && parsed.user_id === userId && parsed.isActive) {
          return parsed;
        }
      } catch (e) {
        console.warn('Donor profile cache read error:', e);
      }
    }

    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('blood_donors')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) return null;

      const donor: BloodDonor = {
        id: data.id,
        user_id: data.user_id,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone || undefined,
        bloodGroup: data.blood_group,
        city: data.city,
        state: data.state,
        country: data.country,
        preferredContactMethod: data.preferred_contact_method,
        availability: data.availability,
        lastDonationDate: data.last_donation_date || undefined,
        consentGiven: data.consent_given,
        consentGivenAt: data.consent_given_at,
        notificationsPaused: data.notifications_paused,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      localStorage.setItem(STORAGE_KEYS.BLOOD_DONOR, JSON.stringify(donor));
      return donor;
    } catch (err) {
      console.warn('Failed to fetch blood donor profile from Supabase:', err);
      return null;
    }
  },

  async upsertDonorProfile(donor: BloodDonor): Promise<BloodDonor> {
    localStorage.setItem(STORAGE_KEYS.BLOOD_DONOR, JSON.stringify(donor));

    auditLogger.logAction(
      'BLOOD_DONOR_REGISTER',
      `Registered/Updated blood donor profile for ${donor.email} (Blood Group: ${donor.bloodGroup}). Privacy consent recorded.`,
      { userId: donor.user_id, bloodGroup: donor.bloodGroup, city: donor.city },
      'SUCCESS'
    );

    if (!isSupabaseConfigured) return donor;

    try {
      const { error } = await supabase.from('blood_donors').upsert({
        id: donor.id,
        user_id: donor.user_id,
        full_name: donor.fullName,
        email: donor.email,
        phone: donor.phone || null,
        blood_group: donor.bloodGroup,
        city: donor.city,
        state: donor.state,
        country: donor.country,
        preferred_contact_method: donor.preferredContactMethod,
        availability: donor.availability,
        last_donation_date: donor.lastDonationDate || null,
        consent_given: donor.consentGiven,
        consent_given_at: donor.consentGivenAt,
        notifications_paused: donor.notificationsPaused,
        is_active: donor.isActive,
        updated_at: new Date().toISOString(),
      });

      if (error) console.warn('Supabase donor upsert error:', error.message);
    } catch (err) {
      console.warn('Failed to save donor profile to Supabase:', err);
    }

    return donor;
  },

  async updateDonorSettings(
    userId: string,
    settings: { notificationsPaused?: boolean; availability?: AvailabilityStatus; isActive?: boolean }
  ): Promise<boolean> {
    const cached = localStorage.getItem(STORAGE_KEYS.BLOOD_DONOR);
    if (cached) {
      try {
        const parsed: BloodDonor = JSON.parse(cached);
        if (parsed && parsed.user_id === userId) {
          const updated = {
            ...parsed,
            ...settings,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEYS.BLOOD_DONOR, JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Donor cache update error:', e);
      }
    }

    if (!isSupabaseConfigured) return true;

    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (settings.notificationsPaused !== undefined) payload.notifications_paused = settings.notificationsPaused;
      if (settings.availability !== undefined) payload.availability = settings.availability;
      if (settings.isActive !== undefined) payload.is_active = settings.isActive;

      const { error } = await supabase
        .from('blood_donors')
        .update(payload)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to update donor settings in Supabase:', err);
      return false;
    }
  },

  async leaveNetwork(userId: string): Promise<boolean> {
    localStorage.removeItem(STORAGE_KEYS.BLOOD_DONOR);

    auditLogger.logAction(
      'BLOOD_DONOR_LEAVE',
      `User ${userId} requested to leave the Blood Donation Network. Profile deactivated.`,
      { userId },
      'SUCCESS'
    );

    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase
        .from('blood_donors')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Failed to deactivate donor in Supabase:', err);
      return false;
    }
  },

  async fetchVerifiedOrganizations(): Promise<VerifiedBloodOrganization[]> {
    const cached = localStorage.getItem(STORAGE_KEYS.BLOOD_ORGS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  },

  async fetchMatchedRequests(bloodGroup?: BloodGroup, city?: string, state?: string): Promise<BloodRequest[]> {
    const cached = localStorage.getItem(STORAGE_KEYS.BLOOD_REQUESTS);
    if (cached) {
      try {
        const parsed: BloodRequest[] = JSON.parse(cached);
        if (bloodGroup) {
          return parsed.filter((r) => r.status === 'OPEN' && r.bloodGroup === bloodGroup);
        }
        return parsed.filter((r) => r.status === 'OPEN');
      } catch (e) {}
    }
    return [];
  },

  async createOrgBloodRequest(req: BloodRequest): Promise<boolean> {
    const cached = localStorage.getItem(STORAGE_KEYS.BLOOD_REQUESTS);
    let list: BloodRequest[] = [];
    if (cached) {
      try {
        list = JSON.parse(cached);
      } catch (e) {}
    }
    list = [req, ...list];
    localStorage.setItem(STORAGE_KEYS.BLOOD_REQUESTS, JSON.stringify(list));

    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase.from('blood_requests').insert({
        id: req.id,
        org_id: req.orgId,
        org_name: req.orgName,
        blood_group: req.bloodGroup,
        units_needed: req.unitsNeeded,
        urgency: req.urgency,
        hospital_name: req.hospitalName,
        city: req.city,
        state: req.state,
        contact_email: req.contactEmail,
        additional_instructions: req.additionalInstructions || null,
        status: req.status,
        created_at: req.createdAt,
      });

      if (error) console.warn('Supabase blood request insert error:', error.message);
    } catch (err) {
      console.warn('Failed to save blood request to Supabase:', err);
    }

    return true;
  },

  async respondToRequest(requestId: string, donorId: string, response: 'RESPONDED_YES' | 'RESPONDED_NO'): Promise<boolean> {
    auditLogger.logAction(
      'BLOOD_DONATION_RESPONSE',
      `Donor ${donorId} responded ${response} to request ${requestId}.`,
      { requestId, donorId, response },
      'SUCCESS'
    );
    const key = `jeevancare_donor_response_${requestId}`;
    localStorage.setItem(key, response);
    return true;
  },
};

