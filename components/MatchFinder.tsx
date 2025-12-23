
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MapPin, Phone, MessageSquare, Heart, Clock, Package, Check, Trash2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { AppState, Donor, Match, MatchStatus, BloodUnit } from '../types';

interface MatchFinderProps {
  requestId: number;
  state: AppState;
  addMatch: (match: Match) => void;
  updateBloodUnit: (id: number, updates: Partial<BloodUnit>) => void;
  setPath: (path: string) => void;
}

export const MatchFinder: React.FC<MatchFinderProps> = ({ requestId, state, addMatch, updateBloodUnit, setPath }) => {
  const request = useMemo(() => 
    state.requests.find(r => r.id === requestId), 
  [state.requests, requestId]);

  const compatibleDonors = useMemo(() => {
    if (!request) return [];
    return state.donors.filter(donor => {
      const sameGroup = donor.bloodGroup === request.bloodGroup;
      const active = donor.isActive;
      let eligible = true;
      if (donor.lastDonation) {
        const lastDate = new Date(donor.lastDonation).getTime();
        const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
        eligible = (Date.now() - lastDate) > ninetyDaysInMs;
      }
      const sameCity = donor.city.toLowerCase() === request.city.toLowerCase();
      return sameGroup && active && eligible && sameCity;
    });
  }, [state.donors, request]);

  const inventoryUnits = useMemo(() => {
    if (!request) return [];
    return state.inventory.filter(u => u.bloodGroup === request.bloodGroup);
  }, [state.inventory, request]);

  const availableStock = useMemo(() => 
    inventoryUnits.filter(u => u.status === 'available' && new Date(u.expiresAt) > new Date()), 
  [inventoryUnits]);

  const reservedUnits = useMemo(() => 
    inventoryUnits.filter(u => u.status === 'reserved' && u.reservedForRequestId === requestId), 
  [inventoryUnits]);

  const handleMatchStatus = (donorId: number, status: MatchStatus) => {
    const newMatch: Match = {
      id: Date.now(),
      requestId,
      donorId,
      status,
      createdAt: new Date().toISOString(),
    };
    addMatch(newMatch);
  };

  if (!request) return <div className="p-8 text-center text-slate-900 font-bold">Request not found.</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center gap-6">
        <button
          onClick={() => setPath('/requests')}
          className="p-4 glass rounded-3xl hover:bg-white shadow-lg transition-all"
        >
          <ChevronLeft size={24} className="text-slate-900" strokeWidth={3} />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900">Patient Matcher</h1>
          <p className="text-slate-500 font-bold">Connecting {request.patientName} with vital resources</p>
        </div>
      </div>

      <GlassCard className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-none shadow-2xl shadow-red-200" noHover>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-4">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-black bg-white/20 px-3 py-1 rounded-full tracking-widest">Medical Directive</span>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[1.5rem] bg-white/20 flex items-center justify-center font-black text-4xl shadow-inner">
                {request.bloodGroup}
              </div>
              <div>
                <h3 className="text-3xl font-black leading-tight">{request.patientName}</h3>
                <p className="text-white/80 font-bold flex items-center gap-2">
                  <MapPin size={16} />
                  {request.hospital || 'Hospital unspecified'} • {request.area}, {request.city}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-6 py-4 bg-white/10 rounded-3xl min-w-[100px] border border-white/20">
              <p className="text-[10px] uppercase font-black opacity-60 tracking-widest mb-1">Units Needed</p>
              <p className="text-3xl font-black">{request.unitsNeeded}</p>
            </div>
            <div className="text-center px-6 py-4 bg-white/10 rounded-3xl min-w-[100px] border border-white/20">
              <p className="text-[10px] uppercase font-black opacity-60 tracking-widest mb-1">Urgency</p>
              <p className="text-3xl font-black capitalize">{request.urgency}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Inventory Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Package size={24} className="text-red-500" />
              Stock Availability
            </h2>
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
              {availableStock.length} Available
            </span>
          </div>

          <div className="space-y-4">
            {reservedUnits.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-black text-green-600 uppercase tracking-widest ml-2">Reserved for this Patient</p>
                {reservedUnits.map(unit => (
                  <div key={unit.id} className="p-4 glass border-2 border-green-200 rounded-3xl flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center font-black">
                        {unit.bloodGroup}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{unit.unitCode}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{unit.storageLocation}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => updateBloodUnit(unit.id, { status: 'available', reservedForRequestId: null })}
                      className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {availableStock.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Available in Cold Storage</p>
                {availableStock.map(unit => (
                  <div key={unit.id} className="p-4 neumorph-flat rounded-3xl flex justify-between items-center hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-black border border-red-100">
                        {unit.bloodGroup}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{unit.unitCode}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expires: {unit.expiresAt}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => updateBloodUnit(unit.id, { status: 'reserved', reservedForRequestId: requestId })}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg"
                    >
                      RESERVE
                    </button>
                  </div>
                ))}
              </div>
            ) : reservedUnits.length === 0 && (
              <div className="py-12 text-center neumorph-inset rounded-[3rem] text-slate-400 font-bold">
                No matching units in stock.
              </div>
            )}
          </div>
        </section>

        {/* Donors Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Heart size={24} className="text-red-500" />
              Live Donor Registry
            </h2>
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
              {compatibleDonors.length} Nearby
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {compatibleDonors.map((donor, idx) => {
                const match = state.matches.find(m => m.donorId === donor.id && m.requestId === requestId);
                return (
                  <GlassCard
                    key={donor.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-black text-xl text-slate-900">{donor.name}</h4>
                          <p className="text-sm text-slate-500 font-bold flex items-center gap-1">
                            <MapPin size={14} className="text-red-400" /> {donor.area}, {donor.city}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-red-500 border border-slate-100">
                          {donor.bloodGroup}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                        <Clock size={16} className="text-red-500" />
                        Last donation: {donor.lastDonation || 'NEVER'}
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        {!match ? (
                          <>
                            <a
                              href={`tel:${donor.phone}`}
                              onClick={() => handleMatchStatus(donor.id, 'contacted')}
                              className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-red-100 hover:scale-105 transition-all"
                            >
                              <Phone size={18} /> CALL
                            </a>
                            <a
                              href={`https://wa.me/${donor.phone}?text=Hi ${donor.name}, urgent blood request for ${request.patientName} (${request.bloodGroup})`}
                              target="_blank"
                              onClick={() => handleMatchStatus(donor.id, 'contacted')}
                              className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:scale-105 transition-all"
                            >
                              <MessageSquare size={18} /> WHATSAPP
                            </a>
                          </>
                        ) : (
                          <div className="w-full space-y-4">
                            <div className={`py-3 rounded-2xl font-black uppercase text-xs text-center border-2 ${
                              match.status === 'donated' ? 'bg-green-50 text-green-600 border-green-200' :
                              match.status === 'declined' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                            }`}>
                              STATUS: {match.status}
                            </div>
                            {match.status !== 'donated' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleMatchStatus(donor.id, 'donated')}
                                  className="flex-1 py-3 bg-green-500 text-white rounded-2xl font-black flex items-center justify-center gap-2"
                                >
                                  <Check size={18} strokeWidth={3} /> MARK DONATED
                                </button>
                                <button
                                  onClick={() => handleMatchStatus(donor.id, 'declined')}
                                  className="px-4 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black"
                                >
                                  DECLINED
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </AnimatePresence>
            {compatibleDonors.length === 0 && (
              <div className="py-20 text-center neumorph-inset rounded-[3rem] text-slate-400 font-bold">
                No matching donors available.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
