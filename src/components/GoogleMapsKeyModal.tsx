import React, { useState, useEffect } from 'react';
import { KeyRound, X, ExternalLink, Sparkles, Check } from 'lucide-react';
import { getGoogleMapsApiKey, setGoogleMapsApiKey, clearGoogleMapsApiKey } from '../maps/googleMapsKeyManager';
import { Button } from './ui/Button';

interface GoogleMapsKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleMapsKeyModal: React.FC<GoogleMapsKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGoogleMapsApiKey());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleMapsApiKey(apiKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    clearGoogleMapsApiKey();
    setApiKey('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1B2D]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E3ECF5] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5B6B80] hover:text-[#0F1B2D] rounded-full p-1.5 hover:bg-[#F5FAFF] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#E8F3FF] text-[#2B8CEB] flex items-center justify-center border border-[#2B8CEB]/20">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F1B2D]">Optional Google Maps Key</h3>
            <p className="text-xs text-[#5B6B80]">Custom Google Maps JS & Routes API</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Default notice */}
          <div className="bg-[#F5FAFF] p-3.5 rounded-2xl border border-[#E3ECF5] space-y-1.5 text-xs text-[#0F1B2D]">
            <div className="flex items-center gap-1.5 text-[#2B8CEB] font-bold">
              <Sparkles className="w-4 h-4" />
              <span>OpenStreetMap Active by Default</span>
            </div>
            <p className="text-[11px] text-[#5B6B80] leading-relaxed">
              RideSync already runs seamlessly with zero setup on high-precision OpenStreetMap tiles and verified Hyderabad tech corridor routes. No API key is required.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0F1B2D] block mb-1.5">
              Google Maps API Key (Optional)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leave empty for OpenStreetMap, or paste AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5FAFF] border border-[#E3ECF5] text-[#0F1B2D] text-xs font-mono focus:outline-none focus:border-[#2B8CEB] focus:ring-2 focus:ring-[#4DA8FF]/20 transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {apiKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#E5484D] hover:bg-[#FFEBEB] transition-colors"
              >
                Clear (Use OSM)
              </button>
            ) : <span />}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                {savedSuccess ? 'Saved!' : 'Save Setting'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
