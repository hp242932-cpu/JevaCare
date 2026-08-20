import React, { useState } from 'react';
import {
  HeartPulse,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  KeyRound,
  Stethoscope,
  Sparkles,
  FileText,
  LockKeyhole,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { JevanCareLoader } from '../common/JevanCareLoader';
import { UserRole } from '../../types';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, resetPassword, demoLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-[#a83b3b]' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-600' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);

    const res = await signIn(email.trim(), password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials. Please check your email and password.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('You must accept the Terms of Service & ABHA Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);

    const res = await signUp(email.trim(), password, fullName.trim(), role);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Could not create account. Please try again.');
    } else {
      setSuccessMessage('Account created successfully! Welcome to Jevan Care.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(email.trim());
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(res.message || `Password reset link sent to ${email}`);
    } else {
      setErrorMessage(res.error || 'Failed to request password reset.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1b3b2b] flex flex-col justify-between font-sans selection:bg-[#1b3b2b] selection:text-white">
      
      {/* Top Brand Header */}
      <header className="px-6 py-5 border-b border-[#e6dfd3] bg-[#fcfaf6]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1b3b2b] flex items-center justify-center text-white shadow-md">
              <HeartPulse className="w-6 h-6 text-[#a3d4b6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-editorial text-2xl tracking-tight font-bold text-[#1b3b2b]">
                  Jevan Care
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#e8eee5] text-[#2b503b] border border-[#d3decf]">
                  Ecosystem
                </span>
              </div>
              <p className="text-xs text-[#5c5647] font-medium hidden sm:block">
                Lifelong Encrypted Digital Health Record & AI Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => demoLogin('patient')}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#e8eee5] hover:bg-[#d8e4d3] text-[#1b3b2b] transition-all flex items-center gap-1.5 border border-[#c5d8c0] cursor-pointer"
              title="Instant test mode as patient"
            >
              <User className="w-3.5 h-3.5 text-[#2b503b]" />
              <span className="hidden sm:inline">Demo Patient</span>
            </button>
            <button
              onClick={() => demoLogin('doctor')}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#1b3b2b] hover:bg-[#244836] text-[#fcfaf6] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Instant test mode as doctor"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#a3d4b6]" />
              <span className="hidden sm:inline">Demo Doctor</span>
            </button>
          </div>
        </div>
      </header>

      {/* Central Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Story & Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f8ebea] border border-[#eed8d7] text-[#a83b3b] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#a83b3b]" />
              <span>ABDM & ABHA National Health Stack Compliant</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-editorial font-bold text-[#1b3b2b] leading-[1.15] tracking-tight">
              Your health, <br />
              <span className="italic font-normal text-[#2b503b]">thoughtfully cared for.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#5c5647] leading-relaxed max-w-xl font-normal">
              A lifelong, zero-compromise digital health platform. Safely store medical records, audit prescriptions with AI, consult certified doctors, and sync with your Ayushman Bharat Health Account (ABHA).
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#e6dfd3] shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#e8eee5] flex items-center justify-center text-[#1b3b2b]">
                  <LockKeyhole className="w-4 h-4 text-[#2b503b]" />
                </div>
                <h2 className="text-sm font-bold text-[#1b3b2b]">256-Bit Vault Storage</h2>
                <p className="text-xs text-[#827b6c]">AES-encrypted records with instant doctor permission toggles.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e6dfd3] shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#f8ebea] flex items-center justify-center text-[#a83b3b]">
                  <Sparkles className="w-4 h-4 text-[#a83b3b]" />
                </div>
                <h2 className="text-sm font-bold text-[#1b3b2b]">Clinical AI Intelligence</h2>
                <p className="text-xs text-[#827b6c]">Ground-truth medical literature checking & OCR prescription parsing.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e6dfd3] shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#e8eee5] flex items-center justify-center text-[#1b3b2b]">
                  <FileText className="w-4 h-4 text-[#2b503b]" />
                </div>
                <h2 className="text-sm font-bold text-[#1b3b2b]">ABHA Health Card</h2>
                <p className="text-xs text-[#827b6c]">Seamless government health stack linkage with 14-digit ABHA ID.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e6dfd3] shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#f8ebea] flex items-center justify-center text-[#a83b3b]">
                  <Stethoscope className="w-4 h-4 text-[#a83b3b]" />
                </div>
                <h2 className="text-sm font-bold text-[#1b3b2b]">Integrated Consultations</h2>
                <p className="text-xs text-[#827b6c]">Connect with verified specialists and telemedicine centers.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3 text-xs text-[#827b6c]">
              <span className="flex items-center gap-1 font-semibold text-[#1b3b2b]">
                <Check className="w-4 h-4 text-[#2b503b]" /> Row Level Security
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-[#1b3b2b]">
                <Check className="w-4 h-4 text-[#2b503b]" /> Complete Data Privacy
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-[#1b3b2b]">
                <Check className="w-4 h-4 text-[#2b503b]" /> Supabase Auth
              </span>
            </div>
          </div>

          {/* Right Column: Authentication Form Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white rounded-3xl border border-[#e6dfd3] shadow-xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
              
              {/* Subtle top decoration bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1b3b2b] via-[#2b503b] to-[#a83b3b]" />

              {/* Form Navigation Tabs */}
              <div className="flex items-center justify-between p-1 bg-[#f6f2e9] rounded-2xl border border-[#e6dfd3]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-white text-[#1b3b2b] shadow-xs'
                      : 'text-[#827b6c] hover:text-[#1b3b2b]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-[#1b3b2b] shadow-xs'
                      : 'text-[#827b6c] hover:text-[#1b3b2b]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Mode Headlines */}
              <div>
                <h2 className="text-xl font-bold text-[#1b3b2b]">
                  {mode === 'login' && 'Welcome Back to Jevan Care'}
                  {mode === 'signup' && 'Create Your Lifelong Health Account'}
                  {mode === 'forgot' && 'Reset Your Password'}
                </h2>
                <p className="text-xs text-[#827b6c] mt-1">
                  {mode === 'login' && 'Enter your registered credentials to access your health vault and dashboard.'}
                  {mode === 'signup' && 'Join Jevan Care for encrypted health storage and personalized care.'}
                  {mode === 'forgot' && 'We will send a secure password reset link to your email address.'}
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-[#f8ebea] border border-[#eed8d7] text-[#a83b3b] text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-[#a83b3b] shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-[#e8eee5] border border-[#d3decf] text-[#2b503b] text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#2b503b] shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1b3b2b]">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827b6c]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. aarav.sharma@health.in"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#fcfaf6] border border-[#e6dfd3] rounded-xl text-xs font-medium text-[#1b3b2b] placeholder-[#a8a192] focus:outline-none focus:ring-2 focus:ring-[#1b3b2b]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1b3b2b]">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-[11px] font-bold text-[#2b503b] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827b6c]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#fcfaf6] border border-[#e6dfd3] rounded-xl text-xs font-medium text-[#1b3b2b] placeholder-[#a8a192] focus:outline-none focus:ring-2 focus:ring-[#1b3b2b]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#827b6c] hover:text-[#1b3b2b]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[#5c5647]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#e6dfd3] text-[#1b3b2b] focus:ring-[#1b3b2b]"
                      />
                      <span>Keep me signed in</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#1b3b2b] hover:bg-[#244836] disabled:opacity-50 text-[#fcfaf6] text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#1b3b2b]"
                  >
                    {isLoading ? (
                      <JevanCareLoader size="sm" color="white" label="Authenticating with Supabase..." />
                    ) : (
                      <>
                        <span>Sign In to Jevan Care</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* SIGN UP FORM */}
              {mode === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1b3b2b]">Full Legal Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827b6c]" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#fcfaf6] border border-[#e6dfd3] rounded-xl text-xs font-medium text-[#1b3b2b] placeholder-[#a8a192] focus:outline-none focus:ring-2 focus:ring-[#1b3b2b]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1b3b2b]">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827b6c]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aarav.sharma@health.in"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#fcfaf6] border border-[#e6dfd3] rounded-xl text-xs font-medium text-[#1b3b2b] placeholder-[#a8a192] focus:outline-none focus:ring-2 focus:ring-[#1b3b2b]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1b3b2b]">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827b6c]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#fcfaf6] border border-[#e6dfd3] rounded-xl text-xs font-medium text-[#1b3b2b] placeholder-[#a8a192] focus:outline-none focus:ring-2 focus:ring-[#1b3b2b]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1b3b2b]">Confirm</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827b6c]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#fcfaf6] border border-[#e6dfd3] rounded-xl text-xs font-medium text-[#1b3b2b] placeholder-[#a8a192] focus:outline-none focus:ring-2 focus:ring-[#1b3b2b]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password strength meter */}
                  {password && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#827b6c]">
                        <span>Password Strength:</span>
                        <span className={`font-bold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#e6dfd3] rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
                      </div>
                    </div>
                  )}

                  {/* Account Role Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1b3b2b]">Account Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('patient')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          role === 'patient'
                            ? 'bg-[#1b3b2b] text-white border-[#1b3b2b]'
                            : 'bg-[#fcfaf6] text-[#5c5647] border-[#e6dfd3] hover:bg-[#f6f2e9]'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Patient</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('doctor')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          role === 'doctor'
                            ? 'bg-[#1b3b2b] text-white border-[#1b3b2b]'
                            : 'bg-[#fcfaf6] text-[#5c5647] border-[#e6dfd3] hover:bg-[#f6f2e9]'
                        }`}
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Doctor</span>
                      </button>
                    </div>
                  </div>

                  {/* Consent checkbox */}
                  <label className="flex items-start gap-2.5 text-xs text-[#5c5647] pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-[#e6dfd3] text-[#1b3b2b] focus:ring-[#1b3b2b]"
                    />
                    <span className="leading-tight">
                      I agree to the <strong>Terms of Care</strong> & <strong>ABHA Privacy Protocols</strong>. My health records remain end-to-end encrypted under my control.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#1b3b2b] hover:bg-[#244836] disabled:opacity-50 text-[#fcfaf6] text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#1b3b2b]"
                  >
                    {isLoading ? (
                      <JevanCareLoader size="sm" color="white" label="Creating Supabase Account..." />
                    ) : (
                      <>
                        <span>Create Health Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* FORGOT PASSWORD FORM */}
              {mode === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1b3b2b]">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827b6c]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aarav.sharma@health.in"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#fcfaf6] border border-[#e6dfd3] rounded-xl text-xs font-medium text-[#1b3b2b] placeholder-[#a8a192] focus:outline-none focus:ring-2 focus:ring-[#1b3b2b]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#1b3b2b] hover:bg-[#244836] disabled:opacity-50 text-[#fcfaf6] text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#1b3b2b]"
                  >
                    {isLoading ? (
                      <JevanCareLoader size="sm" color="white" label="Sending Reset Link..." />
                    ) : (
                      <>
                        <span>Send Password Reset Email</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="w-full text-center text-xs font-bold text-[#2b503b] hover:underline pt-2"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[#e6dfd3] bg-[#fcfaf6] text-center text-xs text-[#827b6c]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Jevan Care Ecosystem • Encrypted Digital Health Network</span>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-[#5c5647]">
            <span>Privacy Policy</span>
            <span>ABHA Integration</span>
            <span>Security Architecture</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
