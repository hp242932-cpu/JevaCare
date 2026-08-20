import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Heart,
  Droplet,
  Phone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { UserProfile, RoleType, VaultItem } from '../../types';
import { AbhaLinkingCard } from './AbhaLinkingCard';

interface UserProfileCenterProps {
  userProfile?: UserProfile;
  profile?: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
  activeRole?: RoleType;
  onRoleChange?: (role: RoleType) => void;
  onAddVaultItem?: (item: VaultItem) => void;
}

export const UserProfileCenter: React.FC<UserProfileCenterProps> = ({
  userProfile,
  profile,
  onUpdateProfile = (_updated: UserProfile) => {},
  activeRole = 'Patient',
  onRoleChange = (_role: RoleType) => {},
  onAddVaultItem,
}) => {
  const currentProfile = userProfile || profile || {
    id: 'u1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@health.in',
    phone: '+91 98765 43210',
    role: 'patient',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Dust Mites'],
    chronicConditions: ['Mild Asthma'],
    emergencyContactName: 'Pooja Sharma',
    emergencyContactPhone: '+91 98765 12345',
    isEmergencySharingEnabled: true,
  };

  const [name, setName] = useState(currentProfile.name || '');
  const [email, setEmail] = useState(currentProfile.email || '');
  const [phone, setPhone] = useState(currentProfile.phone || '');
  const [bloodGroup, setBloodGroup] = useState(currentProfile.bloodGroup || 'O+');
  const [emergencyName, setEmergencyName] = useState(currentProfile.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(currentProfile.emergencyContactPhone || '');

  const [allergies, setAllergies] = useState<string[]>(currentProfile.allergies || []);
  const [newAllergy, setNewAllergy] = useState('');

  const [conditions, setConditions] = useState<string[]>(currentProfile.chronicConditions || []);
  const [newCondition, setNewCondition] = useState('');

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentProfile,
      name,
      email,
      phone,
      bloodGroup,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      allergies,
      chronicConditions: conditions,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md">
            {name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lifelong Health Profile • Emergency Medical Identity
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => onRoleChange('Patient')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeRole === 'Patient'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Patient Mode
          </button>
          <button
            onClick={() => onRoleChange('Doctor')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeRole === 'Doctor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Doctor Portal
          </button>
        </div>
      </div>

      {/* ABHA (Ayushman Bharat Health Account) Linking Component */}
      <AbhaLinkingCard
        userProfile={currentProfile}
        onUpdateProfile={onUpdateProfile}
        onAddVaultItem={onAddVaultItem}
      />

      <form onSubmit={handleSave} className="space-y-6">

        {isSaved && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Health Profile & Medical ID Updated!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Personal Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Personal Identity
            </h3>

            <div>
              <label className="block font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-600" /> Emergency SOS Contacts
            </h3>

            <div>
              <label className="block font-semibold mb-1">Emergency Contact Name</label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Emergency Contact Phone</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>
          </div>

          {/* Allergies & Conditions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 text-xs md:col-span-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> Medical Conditions & Allergies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Allergies */}
              <div className="space-y-2">
                <label className="block font-semibold">Known Drug & Food Allergies</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add allergy..."
                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="p-2 bg-amber-600 text-white rounded-xl font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allergies.map((a, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1"
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() => setAllergies(allergies.filter((_, i) => i !== idx))}
                        className="hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="space-y-2">
                <label className="block font-semibold">Chronic Conditions / History</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Add condition..."
                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={addCondition}
                    className="p-2 bg-teal-600 text-white rounded-xl font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {conditions.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300 font-bold text-[11px] flex items-center gap-1"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => setConditions(conditions.filter((_, i) => i !== idx))}
                        className="hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Changes</span>
        </button>

      </form>

    </div>
  );
};
