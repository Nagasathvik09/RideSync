import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Car, 
  Shield, 
  CheckCircle2, 
  Phone, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Lock, 
  ArrowLeft,
  Building,
  Map as MapIcon
} from 'lucide-react';
import { useStore } from '../lib/store';
import { EmergencyContact } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { GoogleMapsKeyModal } from '../components/GoogleMapsKeyModal';
import { getGoogleMapsApiKey } from '../maps/googleMapsKeyManager';

export const Profile: React.FC = () => {
  const { currentUser, updateProfile, switchUser, toggleRole } = useStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(currentUser.full_name);
  const [mobile, setMobile] = useState(currentUser.mobile);
  const [homeArea, setHomeArea] = useState(currentUser.home_area);
  const [workArea, setWorkArea] = useState(currentUser.work_area);
  const [commuteWindow, setCommuteWindow] = useState('08:30 AM – 09:00 AM');
  const [contacts, setContacts] = useState<EmergencyContact[]>(currentUser.emergency_contacts);

  // New contact state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('Spouse / Family');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Map key modal state
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [hasGoogleKey, setHasGoogleKey] = useState<boolean>(() => Boolean(getGoogleMapsApiKey()));

  useEffect(() => {
    const handleKeyChange = () => {
      setHasGoogleKey(Boolean(getGoogleMapsApiKey()));
    };
    window.addEventListener('google_maps_key_change', handleKeyChange);
    return () => window.removeEventListener('google_maps_key_change', handleKeyChange);
  }, []);

  const isHost = currentUser.current_role === 'host';

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;

    const newC: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: contactName,
      relation: contactRelation,
      phone: contactPhone,
    };

    const updated = [...contacts, newC];
    setContacts(updated);
    updateProfile({ emergency_contacts: updated });
    setContactName('');
    setContactPhone('');
    setToastMessage('Emergency contact saved.');
    setToastOpen(true);
  };

  const handleRemoveContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    updateProfile({ emergency_contacts: updated });
    setToastMessage('Contact removed.');
    setToastOpen(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full bg-white border border-[#E3ECF5] flex items-center justify-center text-[#0F1B2D] hover:bg-[#F5FAFF]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-20 font-bold text-[#0F1B2D] tracking-tight">Profile & Settings</h1>
            <p className="text-xs text-[#5B6B80]">Verified corporate identity</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="text-xs font-bold text-[#2B8CEB] hover:underline"
        >
          Admin Portal
        </button>
      </div>

      {/* User Hero Card */}
      <div className="bg-white border border-[#E3ECF5] rounded-2xl p-4 shadow-soft flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Avatar
            name={currentUser.full_name}
            image={currentUser.photo_url}
            size="lg"
            isWomenOnly={currentUser.gender === 'female'}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-[#0F1B2D]">{currentUser.full_name}</h2>
              <Badge variant="success">Verified</Badge>
            </div>
            <p className="text-xs text-[#5B6B80]">
              {currentUser.employee_id} • Microsoft IDC
            </p>
            <p className="text-[11px] text-[#2B8CEB] font-medium mt-0.5">
              Role: {isHost ? 'Captain (Host)' : 'Rider'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleRole}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#E8F3FF] text-[#2B8CEB] border border-[#2B8CEB]/30 hover:bg-[#4DA8FF] hover:text-[#0F1B2D] transition-all"
        >
          Switch Mode
        </button>
      </div>

      {/* Privacy Note */}
      <div className="p-3.5 bg-[#E8F3FF] border border-[#2B8CEB]/30 rounded-2xl flex items-start gap-3 text-xs text-[#0F1B2D]">
        <Lock className="w-4 h-4 text-[#2B8CEB] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#2B8CEB]">Privacy Guarantee:</strong> Your home address is shown only after a ride is confirmed. Secondary landmarks are used for initial matching.
        </p>
      </div>

      {/* Simple Rows with Chevrons */}
      <div className="space-y-1">
        <span className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B80] px-1 mb-1.5">
          Commute Preferences
        </span>

        <div className="bg-white border border-[#E3ECF5] rounded-2xl divide-y divide-[#E3ECF5] overflow-hidden shadow-xs">
          {/* Preferred Commute Window */}
          <div className="p-4 flex items-center justify-between hover:bg-[#F5FAFF] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F5FAFF] text-[#2B8CEB] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-[#0F1B2D]">
                  Preferred commute window
                </span>
                <span className="text-xs text-[#5B6B80]">{commuteWindow}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5B6B80]" />
          </div>

          {/* Home Area */}
          <div className="p-4 flex items-center justify-between hover:bg-[#F5FAFF] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F5FAFF] text-[#2B8CEB] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-[#0F1B2D]">Home landmark</span>
                <span className="text-xs text-[#5B6B80]">{homeArea}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5B6B80]" />
          </div>

          {/* Work Office */}
          <div className="p-4 flex items-center justify-between hover:bg-[#F5FAFF] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F5FAFF] text-[#2B8CEB] flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-[#0F1B2D]">Corporate Campus</span>
                <span className="text-xs text-[#5B6B80]">{workArea}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5B6B80]" />
          </div>

          {/* Map Engine (Optional Custom Google Maps Key) */}
          <div 
            onClick={() => setKeyModalOpen(true)}
            className="p-4 flex items-center justify-between hover:bg-[#F5FAFF] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F5FAFF] text-[#2B8CEB] flex items-center justify-center">
                <MapIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-[#0F1B2D]">Map Engine</span>
                <span className="text-xs text-[#5B6B80]">
                  {hasGoogleKey ? 'Google Maps (Active)' : 'OpenStreetMap (Default, Zero Key Required)'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#2B8CEB] bg-[#E8F3FF] px-2 py-0.5 rounded-full">
                {hasGoogleKey ? 'Configured' : 'Default'}
              </span>
              <ChevronRight className="w-4 h-4 text-[#5B6B80]" />
            </div>
          </div>

          {/* Safety Verification */}
          <div className="p-4 flex items-center justify-between hover:bg-[#F5FAFF] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F5FAFF] text-[#22B07D] flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-[#0F1B2D]">
                  Background & SSO Check
                </span>
                <span className="text-xs text-[#22B07D] font-medium">Verified by Enterprise HR</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5B6B80]" />
          </div>
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">
            Emergency Contacts ({contacts.length})
          </span>
          <span className="text-[11px] text-[#5B6B80]">Alerted on SOS</span>
        </div>

        <div className="space-y-2">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="p-3.5 bg-white border border-[#E3ECF5] rounded-2xl shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F5FAFF] text-[#2B8CEB] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#0F1B2D]">{c.name}</span>
                    <span className="text-[10px] bg-[#F5FAFF] text-[#5B6B80] px-1.5 py-0.5 rounded border border-[#E3ECF5]">
                      {c.relation}
                    </span>
                  </div>
                  <span className="text-xs text-[#5B6B80] font-mono">{c.phone}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveContact(c.id)}
                className="p-2 text-[#5B6B80] hover:text-[#E5484D] transition-colors"
                title="Remove contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Quick Add Contact Form */}
          <form
            onSubmit={handleAddContact}
            className="p-3 bg-white border border-dashed border-[#E3ECF5] rounded-2xl flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="flex-1 bg-[#F5FAFF] px-2.5 py-1.5 rounded-xl border border-[#E3ECF5] text-xs text-[#0F1B2D] focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="flex-1 bg-[#F5FAFF] px-2.5 py-1.5 rounded-xl border border-[#E3ECF5] text-xs text-[#0F1B2D] focus:outline-none font-mono"
            />
            <button
              type="submit"
              disabled={!contactName || !contactPhone}
              className="px-3 py-1.5 bg-[#4DA8FF] hover:bg-[#2B8CEB] text-[#0F1B2D] hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Persona Switcher for Hackathon Testing */}
      <div className="pt-2">
        <span className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B80] px-1 mb-2">
          Demo Persona Switcher
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => switchUser('user-ananya')}
            className={`p-3 rounded-2xl border text-left text-xs transition-all ${
              currentUser.id === 'user-ananya'
                ? 'bg-[#F3ECFF] border-[#B084F5] text-[#0F1B2D] font-bold'
                : 'bg-white border-[#E3ECF5] text-[#5B6B80]'
            }`}
          >
            <span>Ananya Sharma ♀</span>
            <span className="block text-[11px] font-normal text-[#5B6B80]">Host (Captain)</span>
          </button>

          <button
            type="button"
            onClick={() => switchUser('user-priya')}
            className={`p-3 rounded-2xl border text-left text-xs transition-all ${
              currentUser.id === 'user-priya'
                ? 'bg-[#E8F3FF] border-[#2B8CEB] text-[#0F1B2D] font-bold'
                : 'bg-white border-[#E3ECF5] text-[#5B6B80]'
            }`}
          >
            <span>Priya Rao ♀</span>
            <span className="block text-[11px] font-normal text-[#5B6B80]">Passenger (Rider)</span>
          </button>

          <button
            type="button"
            onClick={() => switchUser('user-rahul')}
            className={`p-3 rounded-2xl border text-left text-xs transition-all ${
              currentUser.id === 'user-rahul'
                ? 'bg-[#E8F3FF] border-[#2B8CEB] text-[#0F1B2D] font-bold'
                : 'bg-white border-[#E3ECF5] text-[#5B6B80]'
            }`}
          >
            <span>Rahul Varma ♂</span>
            <span className="block text-[11px] font-normal text-[#5B6B80]">Passenger (Rider)</span>
          </button>

          <button
            type="button"
            onClick={() => switchUser('user-admin')}
            className={`p-3 rounded-2xl border text-left text-xs transition-all ${
              currentUser.id === 'user-admin'
                ? 'bg-[#E8F3FF] border-[#2B8CEB] text-[#0F1B2D] font-bold'
                : 'bg-white border-[#E3ECF5] text-[#5B6B80]'
            }`}
          >
            <span>Kavita Reddy</span>
            <span className="block text-[11px] font-normal text-[#5B6B80]">Enterprise Admin</span>
          </button>
        </div>
      </div>

      {/* Google Maps Key Configuration Modal (Only opens if user clicks in settings) */}
      <GoogleMapsKeyModal
        isOpen={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
      />

      <Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        type="success"
      />
    </div>
  );
};
