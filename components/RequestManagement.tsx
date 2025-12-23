
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MapPin, Phone, X, ExternalLink, ArrowRight } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { AppState, BloodRequest, BloodGroup, Urgency } from '../types';

interface RequestManagementProps {
  state: AppState;
  addRequest: (req: BloodRequest) => void;
  updateRequest: (id: number, updates: Partial<BloodRequest>) => void;
  setPath: (path: string) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const RequestManagement: React.FC<RequestManagementProps> = ({ state, addRequest, updateRequest, setPath }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    patientName: '',
    hospital: '',
    bloodGroup: 'O+' as BloodGroup,
    unitsNeeded: 1,
    city: '',
    area: '',
    urgency: 'medium' as Urgency,
    contactPhone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: BloodRequest = {
      id: Date.now(),
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    addRequest(newRequest);
    setIsFormOpen(false);
    setFormData({ 
      patientName: '', hospital: '', bloodGroup: 'O+', unitsNeeded: 1, 
      city: '', area: '', urgency: 'medium', contactPhone: '' 
    });
  };

  const filteredRequests = useMemo(() => {
    // Hide completed requests as requested
    return state.requests.filter(r => 
      r.status !== 'completed' && (
      r.patientName.toLowerCase().includes(search.toLowerCase()) || 
      r.city.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.requests, search]);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Active Requests</h1>
          <p className="text-slate-500 font-bold text-xl">Real-time emergency monitoring ({filteredRequests.length} active)</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-red-500 text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 shadow-xl shadow-red-200 hover:scale-105 transition-all self-start text-lg"
        >
          <Plus size={24} strokeWidth={3} />
          POST REQUEST
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        <input
          type="text"
          placeholder="Search by patient name or location..."
          className="w-full pl-16 pr-8 py-5 neumorph-inset rounded-3xl outline-none focus:ring-4 focus:ring-red-100 font-bold text-slate-900 text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {filteredRequests.map((req, idx) => (
            <GlassCard
              key={req.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex flex-col md:flex-row md:items-center justify-between gap-10 border-l-[12px] p-8 ${
                req.urgency === 'high' ? 'border-l-red-500' : 
                req.urgency === 'medium' ? 'border-l-amber-400' : 'border-l-blue-400'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-10">
                <div className="w-24 h-24 rounded-3xl bg-red-50 flex flex-col items-center justify-center border-2 border-red-100">
                  <span className="text-3xl font-black text-red-500">{req.bloodGroup}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{req.unitsNeeded} UNITS</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <h4 className="text-3xl font-black text-slate-900 tracking-tight">{req.patientName}</h4>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      req.status === 'matched' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-lg text-slate-500 font-bold">
                    <span className="flex items-center gap-2">
                      <MapPin size={20} className="text-red-400" />
                      {req.area}, {req.city}
                    </span>
                    {req.hospital && (
                      <span className="flex items-center gap-2">
                        <ExternalLink size={20} className="text-red-400" />
                        {req.hospital}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <button
                  onClick={() => setPath(`/requests/${req.id}/matches`)}
                  className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
                >
                  FIND HEROES
                  <ArrowRight size={20} strokeWidth={3} />
                </button>
                <div className="flex items-center gap-3 px-6 py-4 glass rounded-3xl text-lg font-black text-slate-900 shadow-sm">
                  <Phone size={20} className="text-red-500" />
                  {req.contactPhone}
                </div>
              </div>
            </GlassCard>
          ))}
        </AnimatePresence>
        {filteredRequests.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-50 text-slate-400 font-bold">
            No active emergency alerts at this time.
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl glass bg-white p-12 rounded-[4rem] shadow-2xl overflow-y-auto max-h-[90vh] border-0"
            >
              <button onClick={() => setIsFormOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full">
                <X size={28} className="text-slate-900" />
              </button>
              
              <h2 className="text-4xl font-black mb-10 text-slate-900">Post Urgent Request</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Patient Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-8 py-5 neumorph-inset rounded-3xl outline-none font-bold text-slate-900 text-lg"
                      value={formData.patientName}
                      onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Hospital</label>
                    <input
                      type="text"
                      className="w-full px-8 py-5 neumorph-inset rounded-3xl outline-none font-bold text-slate-900 text-lg"
                      value={formData.hospital}
                      onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Blood Group</label>
                    <select
                      className="w-full px-8 py-5 neumorph-inset rounded-3xl font-bold text-slate-900 text-lg"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({...formData, bloodGroup: e.target.value as BloodGroup})}
                    >
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Units</label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="w-full px-8 py-5 neumorph-inset rounded-3xl font-bold text-slate-900 text-lg"
                      value={formData.unitsNeeded}
                      onChange={(e) => setFormData({...formData, unitsNeeded: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Urgency</label>
                    <select
                      className="w-full px-8 py-5 neumorph-inset rounded-3xl font-bold text-slate-900 text-lg"
                      value={formData.urgency}
                      onChange={(e) => setFormData({...formData, urgency: e.target.value as Urgency})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-6 bg-red-500 text-white font-black rounded-[2.5rem] shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all mt-6 text-xl"
                >
                  BROADCAST ALERT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
