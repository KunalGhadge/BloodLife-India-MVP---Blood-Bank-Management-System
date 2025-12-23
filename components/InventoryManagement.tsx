
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Calendar, MapPin, X, Package, ShieldCheck, Thermometer, Clock, AlertCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { AppState, BloodUnit, BloodGroup, BloodUnitStatus } from '../types';

interface InventoryManagementProps {
  state: AppState;
  addBloodUnit: (unit: BloodUnit) => void;
  updateBloodUnit: (id: number, updates: Partial<BloodUnit>) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STATUSES: BloodUnitStatus[] = ["available", "reserved", "used", "discarded"];

export const InventoryManagement: React.FC<InventoryManagementProps> = ({ state, addBloodUnit, updateBloodUnit }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<BloodGroup | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BloodUnitStatus | 'all'>('available');

  const [formData, setFormData] = useState({
    unitCode: `BLD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    bloodGroup: 'O+' as BloodGroup,
    volumeMl: 450,
    collectedAt: new Date().toISOString().split('T')[0],
    expiresAt: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    storageLocation: 'Fridge A / Shelf 1',
    donorId: null as number | null,
  });

  const isExpired = (expiry: string) => new Date(expiry) < new Date();
  const isExpiringSoon = (expiry: string) => {
    const diff = new Date(expiry).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  };

  const stats = useMemo(() => {
    const total = state.inventory.length;
    const available = state.inventory.filter(u => u.status === 'available' && !isExpired(u.expiresAt)).length;
    const expiringSoon = state.inventory.filter(u => u.status === 'available' && isExpiringSoon(u.expiresAt)).length;
    const expired = state.inventory.filter(u => isExpired(u.expiresAt) && u.status !== 'discarded').length;

    return [
      { label: 'Total Stock', value: total, icon: Package, color: 'blue' },
      { label: 'Available', value: available, icon: ShieldCheck, color: 'green' },
      { label: 'Expiring Soon', value: expiringSoon, icon: Clock, color: 'amber' },
      { label: 'Expired', value: expired, icon: AlertCircle, color: 'red' },
    ];
  }, [state.inventory]);

  const filteredUnits = useMemo(() => {
    return state.inventory.filter(u => {
      const matchesSearch = u.unitCode.toLowerCase().includes(search.toLowerCase()) || 
                            u.storageLocation.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = groupFilter === 'all' || u.bloodGroup === groupFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesGroup && matchesStatus;
    }).sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
  }, [state.inventory, search, groupFilter, statusFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUnit: BloodUnit = {
      id: Date.now(),
      ...formData,
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    addBloodUnit(newUnit);
    setIsFormOpen(false);
    setFormData({
      unitCode: `BLD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      bloodGroup: 'O+',
      volumeMl: 450,
      collectedAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      storageLocation: 'Fridge A / Shelf 1',
      donorId: null,
    });
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900">Cold Storage</h1>
          <p className="text-slate-500 font-bold text-xl">Monitor vital inventory levels and expiry</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 shadow-xl hover:scale-105 transition-all self-start text-lg"
        >
          <Plus size={24} strokeWidth={3} />
          ADD UNIT
        </button>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: idx * 0.1 }}
            className="neumorph-flat rounded-[2.5rem] p-6 flex flex-col items-center text-center gap-2"
          >
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color === 'amber' ? 'amber-500' : stat.color + '-500'} mb-1 shadow-inner`}>
              <stat.icon size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Filters */}
      <div className="flex flex-wrap gap-8 items-center">
        <div className="flex-1 min-w-[320px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <input
            type="text"
            placeholder="Search by Unit Code or Location..."
            className="w-full pl-14 pr-8 py-5 neumorph-inset rounded-3xl outline-none font-bold text-slate-900 text-lg"
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
          <div className="w-[2px] h-6 bg-slate-100 mx-2"></div>
          <select
            className="bg-transparent outline-none cursor-pointer font-black text-slate-700 text-lg appearance-none pr-4"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">ALL STATUS</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* Units List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {filteredUnits.map((unit, idx) => {
            const expired = isExpired(unit.expiresAt);
            const soon = isExpiringSoon(unit.expiresAt);
            const donor = state.donors.find(d => d.id === unit.donorId);
            
            return (
              <GlassCard
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className={`border-2 ${expired && unit.status !== 'discarded' ? 'border-red-400 shadow-red-100' : 'border-white'} ${unit.status === 'used' || unit.status === 'discarded' ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-red-500 font-black text-2xl border-2 border-red-50">
                      {unit.bloodGroup}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 tracking-widest">{unit.unitCode}</p>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        unit.status === 'available' ? 'bg-green-100 text-green-700' :
                        unit.status === 'reserved' ? 'bg-amber-100 text-amber-700' :
                        unit.status === 'used' ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {unit.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 neumorph-inset rounded-2xl">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage</span>
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        <Thermometer size={14} className="text-red-500" />
                        {unit.storageLocation}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center p-3 neumorph-inset rounded-2xl ${expired ? 'bg-red-50' : soon ? 'bg-amber-50' : ''}`}>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry</span>
                      <span className={`font-bold flex items-center gap-2 ${expired ? 'text-red-600' : soon ? 'text-amber-600' : 'text-slate-900'}`}>
                        <Calendar size={14} />
                        {unit.expiresAt}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    {unit.status === 'available' && !expired && (
                      <button 
                        onClick={() => updateBloodUnit(unit.id, { status: 'reserved' })}
                        className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black"
                      >
                        RESERVE
                      </button>
                    )}
                    {unit.status === 'available' && expired && (
                      <button 
                        onClick={() => updateBloodUnit(unit.id, { status: 'discarded' })}
                        className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-xs font-black"
                      >
                        DISCARD
                      </button>
                    )}
                    {unit.status === 'reserved' && (
                      <button 
                        onClick={() => updateBloodUnit(unit.id, { status: 'used' })}
                        className="flex-1 py-3 bg-green-500 text-white rounded-2xl text-xs font-black"
                      >
                        MARK USED
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Unit Modal */}
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
              
              <h2 className="text-4xl font-black mb-10 text-slate-900 text-center">Inbound Unit</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Blood Group</label>
                    <select
                      className="w-full px-8 py-5 neumorph-inset rounded-3xl font-bold text-slate-900 text-lg cursor-pointer"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({...formData, bloodGroup: e.target.value as BloodGroup})}
                    >
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Volume (ML)</label>
                    <input
                      required
                      type="number"
                      className="w-full px-8 py-5 neumorph-inset rounded-3xl font-bold text-slate-900 text-lg"
                      value={formData.volumeMl}
                      onChange={(e) => setFormData({...formData, volumeMl: parseInt(e.target.value) || 450})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Collection Date</label>
                  <input
                    required
                    type="date"
                    className="w-full px-8 py-5 neumorph-inset rounded-3xl font-bold text-slate-900 text-lg"
                    value={formData.collectedAt}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      const expiry = new Date(date.getTime() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setFormData({...formData, collectedAt: e.target.value, expiresAt: expiry});
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Expiry Date (Auto-calc 42 days)</label>
                  <input
                    required
                    type="date"
                    className="w-full px-8 py-5 neumorph-inset rounded-3xl font-bold text-slate-900 text-lg"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Storage Location</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Fridge A / Shelf 2"
                    className="w-full px-8 py-5 neumorph-inset rounded-3xl font-bold text-slate-900 text-lg"
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({...formData, storageLocation: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-6 bg-red-500 text-white font-black rounded-[2.5rem] shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all mt-6 text-xl"
                >
                  LOG INBOUND UNIT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
