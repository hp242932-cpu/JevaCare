-- JeevanCare Supabase Complete Database Schema & RLS Policies
-- Project ID: jwphdtforsqrojhkcyrb
-- Target Engine: PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. PROFILES TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
    phone TEXT,
    age INT,
    gender TEXT,
    blood_group TEXT,
    allergies TEXT[] DEFAULT '{}',
    chronic_conditions TEXT[] DEFAULT '{}',
    mfa_enabled BOOLEAN DEFAULT false,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    is_emergency_sharing_enabled BOOLEAN DEFAULT true,
    abha_number TEXT,
    abha_address TEXT,
    abha_linked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile on signup" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

--------------------------------------------------------------------------------
-- 2. ACTIVE MEDICINES TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.active_medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    salt TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    doctor_name TEXT,
    instructions TEXT,
    remaining_doses INT NOT NULL DEFAULT 10,
    total_doses INT NOT NULL DEFAULT 30,
    refill_required BOOLEAN DEFAULT false,
    prescribed_for TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.active_medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their active medicines"
    ON public.active_medicines FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 3. MEDICAL VAULT ITEMS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vault_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Prescription', 'Doctor Note', 'Lab Report', 'X-Ray / Scan', 
        'ECG', 'Vaccination', 'Insurance', 'Bill', 'Allergy Record', 'Discharge Summary'
    )),
    doctor_name TEXT,
    disease_or_tag TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    file_size TEXT NOT NULL DEFAULT '1.2 MB',
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'jpg', 'png', 'doc')),
    file_url TEXT,
    notes TEXT,
    shared_link TEXT,
    shared_expiry DATE,
    is_important BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their vault items"
    ON public.vault_items FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 4. APPOINTMENTS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('In-Person', 'Audio', 'Video')),
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Completed', 'Cancelled')),
    fees NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    prescriptions_shared TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their appointments"
    ON public.appointments FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 5. HEALTH METRIC LOGS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_metric_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    systolic_bp INT,
    diastolic_bp INT,
    blood_sugar NUMERIC,
    weight NUMERIC,
    temperature NUMERIC,
    sleep_hours NUMERIC,
    mood TEXT CHECK (mood IN ('Great', 'Good', 'Neutral', 'Poor', 'Severe')),
    pain_level INT CHECK (pain_level BETWEEN 1 AND 10),
    symptoms TEXT[] DEFAULT '{}',
    notes TEXT
);

ALTER TABLE public.health_metric_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their health metric logs"
    ON public.health_metric_logs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 6. MEDICINE REMINDERS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    times TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    days_of_week TEXT[] DEFAULT '{"Mon","Tue","Wed","Thu","Fri","Sat","Sun"}',
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their reminders"
    ON public.reminders FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 7. ASSISTANT CHAT MESSAGES TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assistant_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    text TEXT NOT NULL,
    image_url TEXT,
    audio_url TEXT,
    has_red_flags BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their assistant messages"
    ON public.assistant_messages FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 8. STORAGE BUCKET CONFIGURATION & POLICIES
--------------------------------------------------------------------------------
-- Create medical-documents storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-documents', 'medical-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies
CREATE POLICY "Users can upload their medical documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their medical documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their medical documents"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
