import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Users, ClipboardList, CheckCircle, Droplet, ArrowRight, HeartPulse, MapPin, Package, AlertTriangle } from 'lucide-react';
import { AppState, BloodRequest } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  state: AppState;
  setPath: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, setPath }) => {
  const stats = useMemo(() => {
    const pendingRequests = state.requests.filter(r => r.status === 'pending').length;
    const successfulMatches = state.matches.filter(m => m.status === 'donated').length;
    
    return [
      { label: 'Total Donors', value: state.donors.length, icon: Users, color: 'red' },
      { label: 'Stock Units', value: state.inventory.length, icon: Package, color: 'red' },
      { label: 'Lives Saved', value: successfulMatches, icon: CheckCircle, color: 'red' },
      { label: 'Active Alerts', value: pendingRequests, icon: ClipboardList, color: 'red' },
    ];
  }, [state]);

  const urgentRequests = useMemo(() => {
    return [...state.requests]
      .filter(r => r.status === 'pending')
      .sort((a, b) => {
        const urgencyScore = { high: 3, medium: 2, low: 1 };
        if (urgencyScore[b.urgency] !== urgencyScore[a.urgency]) {
          return urgencyScore[b.urgency] - urgencyScore[a.urgency];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 3);
  }, [state]);

  const bloodGroupData = useMemo(() => {
    const groups: Record<string, number> = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
    };
    state.inventory.forEach(unit => {
      if (unit.status === 'available') {
        groups[unit.bloodGroup] = (groups[unit.bloodGroup] || 0) + 1;
      }
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [state.inventory]);

  const inventoryStatusData = useMemo(() => {
    const status: Record<string, number> = {
      'AVAILABLE': 0, 'RESERVED': 0, 'USED': 0, 'DISCARDED': 0
    };
    state.inventory.forEach(unit => {
      const s = unit.status.toUpperCase();
      status[s] = (status[s] || 0) + 1;
    });
    return Object.entries(status)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [state.inventory]);

  const CHART_COLORS = ['#ef4444', '#dc2626', '#f87171', '#991b1b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-12 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm">
            <HeartPulse size={14} className="animate-pulse" />
            Connecting Lives Across India
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Give the Gift of <br />
            <span className="text-red-600">Life Today</span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Real-time blood bank management for donors, hospitals, and cold storage monitoring.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={() => setPath('/donors')}
            className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-base"
          >
            BECOME A DONOR
            <ArrowRight size={20} strokeWidth={3} />
          </button>
          <button
            onClick={() => setPath('/inventory')}
            className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black border-2 border-slate-100 hover:border-red-200 transition-all shadow-sm text-base"
          >
            MANAGE INVENTORY
          </button>

          {/* Documentation button - navigate to local /documentation/index.html */}
          <a
            href="/documentation/index.html"
            className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black border-2 border-slate-100 hover:border-red-200 transition-all shadow-sm text-base flex items-center gap-2"
          >
            VIEW DOCUMENTATION
          </a>
        </motion.div>
      </section>

      {/* Stats - Horizontal Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-3xl p-6 flex flex-col items-center text-center gap-2 shadow-sm border border-slate-50 hover:shadow-md transition-all cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-1">
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="flex flex-col border-none shadow-sm" noHover>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Package size={18} className="text-red-500" />
              Inventory by Group
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloodGroupData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 800 }}
                />
                <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col border-none shadow-sm" noHover>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Storage Status
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryStatusData.length > 0 ? inventoryStatusData : [{ name: 'EMPTY', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {inventoryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                  ))}
                  {inventoryStatusData.length === 0 && <Cell fill="#f1f5f9" stroke="none" />}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 800 }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 800 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </section>

      {/* Emergency Alerts */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-3xl font-black text-slate-900">Emergency Alerts</h2>
          <button 
            onClick={() => setPath('/requests')} 
            className="text-red-600 font-black hover:text-red-700 flex items-center gap-2 text-sm transition-all"
          >
            VIEW ALL <ArrowRight size={18} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {urgentRequests.length > 0 ? urgentRequests.map((req, idx) => (
            <GlassCard key={req.id} className="border-none shadow-sm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                    {req.bloodGroup}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    req.urgency === 'high' ? 'bg-red-100 text-red-600' : 
                    req.urgency === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {req.urgency}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-black text-xl text-slate-900 leading-tight mb-1">{req.patientName}</h4>
                  <p className="text-slate-500 font-bold text-xs flex items-center gap-1">
                    <MapPin size={12} className="text-red-400" />
                    {req.hospital || 'Medical Center'}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2 text-slate-900 font-black">
                    <Droplet size={18} className="text-red-500" />
                    <span>{req.unitsNeeded} Units</span>
                  </div>
                  <button 
                    onClick={() => setPath(`/requests/${req.id}/matches`)}
                    className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </GlassCard>
          )) : (
            <div className="col-span-full py-16 text-center bg-white rounded-[2rem] border border-slate-50 shadow-sm">
              <ClipboardList size={40} className="text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active alerts</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
