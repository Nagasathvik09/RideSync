import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, CheckCircle2, ArrowRight, RefreshCw, X } from 'lucide-react';
import { useStore } from '../lib/store';

export const DemoBanner: React.FC = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const { switchUser, resetDatabase } = useStore();
  const navigate = useNavigate();

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 1:
        switchUser('user-ananya');
        navigate('/host');
        break;
      case 2:
        switchUser('user-priya');
        navigate('/find');
        break;
      case 3:
        switchUser('user-rahul');
        navigate('/find');
        break;
      case 4:
        switchUser('user-ananya');
        navigate('/requests');
        break;
      case 5:
        navigate('/live/carpool-ananya-01');
        break;
      case 6:
        switchUser('user-admin');
        navigate('/admin');
        break;
    }
    setDemoModalOpen(false);
  };

  return (
    <>
      {/* Floating Minimalist Demo Pill (Subtle, unobtrusive) */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-6">
        <button
          onClick={() => setDemoModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-lg hover:shadow-xl transition-all border border-sky-400/40"
          title="Open Hackathon Demo Guide"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-200" />
          <span>Demo Flow</span>
        </button>
      </div>

      {/* Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Demo Presentation Flow</h3>
                <p className="text-xs text-slate-500">Click any step to teleport directly to that screen with the right persona.</p>
              </div>
            </div>

            <div className="space-y-2.5 my-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Step 1 */}
              <div 
                onClick={() => handleStepClick(1)}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50/60 hover:border-sky-300 cursor-pointer transition-all flex items-start justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center">1</span>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-sky-700">Driver Hosts Commute</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 font-semibold">Women-Only</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">
                    Ananya (female host, Hyundai i20) sets Gachibowli → HITEC City with Public/Private/Women-Only toggle.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors mt-1" />
              </div>

              {/* Step 2 */}
              <div 
                onClick={() => handleStepClick(2)}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50/60 hover:border-sky-300 cursor-pointer transition-all flex items-start justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center">2</span>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-sky-700">Priya Finds & Matches</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 font-semibold">91% Match</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">
                    Priya posts Kondapur pickup; AI scoring shows explainable reasons and pink Women-Only badge.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors mt-1" />
              </div>

              {/* Step 3 */}
              <div 
                onClick={() => handleStepClick(3)}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50/60 hover:border-sky-300 cursor-pointer transition-all flex items-start justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">3</span>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-rose-700">Strict Safety Filter (Rahul)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">Server Enforced</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">
                    Switch to Rahul (male): Women-Only rides never appear, proving privacy and zero bypass.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors mt-1" />
              </div>

              {/* Step 4 */}
              <div 
                onClick={() => handleStepClick(4)}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50/60 hover:border-sky-300 cursor-pointer transition-all flex items-start justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center">4</span>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-sky-700">Host Approval & Stop Planning</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 font-semibold">OTP Generated</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">
                    Ananya accepts Priya's request; seats decrement, stops are sequenced, and secret OTP is issued.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors mt-1" />
              </div>

              {/* Step 5 */}
              <div 
                onClick={() => handleStepClick(5)}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50/60 hover:border-sky-300 cursor-pointer transition-all flex items-start justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center">5</span>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-sky-700">Live Trip & Persistent SOS</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">Live Simulation</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">
                    Watch car move along polyline, verify passenger OTP code, and test 5-second cancel SOS emergency alert.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors mt-1" />
              </div>

              {/* Step 6 */}
              <div 
                onClick={() => handleStepClick(6)}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50/60 hover:border-sky-300 cursor-pointer transition-all flex items-start justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">6</span>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-purple-700">Admin Sustainability Dashboard</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">CO2 & Audit CSV</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">
                    Inspect seat occupancy %, kg CO2 saved, commute peak heatmaps, and logged SOS security events with CSV export.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors mt-1" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs text-slate-500">
              <button
                onClick={() => {
                  if (window.confirm('Reset all demo rides, requests, and seed data to initial state?')) {
                    resetDatabase();
                    navigate('/dashboard');
                    setDemoModalOpen(false);
                  }
                }}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>

              <button
                onClick={() => setDemoModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
