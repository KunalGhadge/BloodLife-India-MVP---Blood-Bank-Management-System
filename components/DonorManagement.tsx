
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Phone, MapPin, Calendar, Activity, X } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { AppState, Donor, BloodGroup } from '../types';

interface DonorManagementProps {
  state: AppState;
  addDonor: (donor: Donor) => void;
  updateDonor: (id: number, updates: Partial<Donor>) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const DonorManagement: React.FC<DonorManagementProps> = ({ state, addDonor, updateDonor }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<BloodGroup | 'all'>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodGroup: 'O+' as BloodGroup,
    city: '',
    area: '',
    lastDonation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDonor: Donor = {
      id: Date.now(),
      ...formData,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    addDonor(newDonor);
    setIsFormOpen(false);
    setFormData({ name: '', phone: '', bloodGroup: 'O+', city: '', area: '', lastDonation: '' });
  };

  const filteredDonors = useMemo(() => {
    return state.donors.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                            d.city.toLowerCase().includes(search.toLowerCase()) ||
                            d.area.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = groupFilter === 'all' || d.bloodGroup === groupFilter;
      return matchesSearch && matchesGroup;
    });
  }, [state.donors, search, groupFilter]);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900">Life-Saving Community</h1>
          <p className="text-slate-500 font-bold text-xl">{state.donors.length} registered heroes ready to help</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-red-500 text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 shadow-xl shadow-red-200 hover:scale-105 transition-all self-start text-lg"
        >
          <Plus size={24} strokeWidth={3} />
          REGISTER NOW
        </button>
      </div>

      {/* Filters - Neumorphic Style */}
      <div className="flex flex-wrap gap-8 items-center">
        <div className="flex-1 min-w-[320px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <input
            type="text"
            placeholder="Search heroes by name or city..."
            className="w-full pl-14 pr-8 py-5 neumorph-inset rounded-3xl focus:ring-4 focus:ring-red-100 outline-none font-bold text-slate-700 text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 neumorph-flat px-8 py-5 rounded-3xl">
          <Filter size={24} className="text-red-500" />
          <select
            className="bg-transparent outline-none cursor-pointer font-black text-slate-700 text-lg appearance-none pr-4"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value as any)}
          >
            <option value="all">ALL GROUPS</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {filteredDonors.map((donor, idx) => (
            <GlassCard
              key={donor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className={`border-2 ${!donor.isActive ? 'opacity-50 grayscale border-slate-100' : 'border-white'}`}
            >
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-white shadow-xl flex items-center justify-center text-red-500 font-black text-2xl border-2 border-red-50">
                      {donor.bloodGroup}
                    </div>
                    <div>
                      <h4 className="font-black text-2xl text-slate-900 tracking-tight">{donor.name}</h4>
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase">
                        <MapPin size={14} className="text-red-400" />
                        {donor.area}, {donor.city}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateDonor(donor.id, { isActive: !donor.isActive })}
                    className={`p-3 rounded-2xl transition-all shadow-sm ${donor.isActive ? 'text-green-600 bg-green-50' : 'text-slate-300 bg-slate-50'}`}
                  >
                    <Activity size={24} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-5 neumorph-inset rounded-3xl flex justify-between items-center group">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Call Now</span>
                    <a href={`tel:${donor.phone}`} className="flex items-center gap-3 text-slate-900 font-black text-lg hover:text-red-500 transition-colors">
                      <Phone size={20} className="text-red-500" />
                      {donor.phone}
                    </a>
                  </div>
                  <div className="p-5 neumorph-inset rounded-3xl flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Last Donation</span>
                    <div className="flex items-center gap-3 text-slate-900 font-black">
                      <Calendar size={20} className="text-red-500" />
                      {donor.lastDonation || 'NEVER'}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal - Pure White Glass */}
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
              className="relative w-full max-w-lg glass bg-white p-12 rounded-[4rem] shadow-2xl overflow-y-auto max-h-[90vh] border-0"
            >
              <button onClick={() => setIsFormOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full transition-colors">
                <X size={28} className="text-slate-900" />
              </button>
              
              <h2 className="text-4xl font-black mb-10 text-slate-900">Join our Hero Network</h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-8 py-5 neumorph-inset rounded-3xl outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold text-slate-900 text-lg"
                    value={formData.name}
                    placeholder="Enter your name..."
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phone</label>
                    <input
                      required
                      type="tel"
                      className="w-full px-8 py-5 neumorph-inset rounded-3xl outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold text-slate-900 text-lg"
                      value={formData.phone}
                      placeholder="+1..."
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Blood Group</label>
                    <select
                      className="w-full px-8 py-5 neumorph-inset rounded-3xl outline-none font-black text-slate-900 text-lg cursor-pointer"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({...formData, bloodGroup: e.target.value as BloodGroup})}
                    >
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">City</label>
                    <input
                      required
                      type="text"
                      className="w-full px-8 py-5 neumorph-inset rounded-3xl font-bold text-slate-900 text-lg"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Area</label>
                    <input
                      required
                      type="text"
                      className="w-full px-8 py-5 neumorph-inset rounded-3xl font-bold text-slate-900 text-lg"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-6 bg-red-500 text-white font-black rounded-[2.5rem] shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all mt-6 text-xl"
                >
                  REGISTER NOW
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
