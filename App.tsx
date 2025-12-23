
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './components/Dashboard';
import { DonorManagement } from './components/DonorManagement';
import { RequestManagement } from './components/RequestManagement';
import { MatchFinder } from './components/MatchFinder';
import { InventoryManagement } from './components/InventoryManagement';
import { AppState, Donor, BloodRequest, Match, BloodUnit } from './types';
import { localDb, initializeDb } from './lib/localDb';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [path, setPath] = useState('/');
  const [state, setState] = useState<AppState>({
    donors: [],
    requests: [],
    matches: [],
    inventory: []
  });

  useEffect(() => {
    initializeDb();
    const donors = localDb.getDonors();
    const requests = localDb.getRequests();
    const matches = localDb.getMatches();
    const inventory = localDb.getInventory();
    setState({ donors, requests, matches, inventory });
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#ffffff', '#dc2626']
    });
  };

  const addDonor = (donor: Donor) => {
    const updated = [donor, ...state.donors];
    setState(prev => ({ ...prev, donors: updated }));
    localDb.saveDonors(updated);
    triggerConfetti();
  };

  const updateDonor = (id: number, updates: Partial<Donor>) => {
    const updated = state.donors.map(d => d.id === id ? { ...d, ...updates } : d);
    setState(prev => ({ ...prev, donors: updated }));
    localDb.saveDonors(updated);
  };

  const addRequest = (req: BloodRequest) => {
    const updated = [req, ...state.requests];
    setState(prev => ({ ...prev, requests: updated }));
    localDb.saveRequests(updated);
    triggerConfetti();
  };

  const updateRequest = (id: number, updates: Partial<BloodRequest>) => {
    const updated = state.requests.map(r => r.id === id ? { ...r, ...updates } : r);
    setState(prev => ({ ...prev, requests: updated }));
    localDb.saveRequests(updated);
  };

  const addMatch = (match: Match) => {
    const exists = state.matches.findIndex(m => m.requestId === match.requestId && m.donorId === match.donorId);
    let updatedMatches;
    if (exists !== -1) {
      updatedMatches = state.matches.map((m, i) => i === exists ? { ...m, status: match.status } : m);
    } else {
      updatedMatches = [...state.matches, match];
    }
    
    setState(prev => ({ ...prev, matches: updatedMatches }));
    localDb.saveMatches(updatedMatches);

    if (match.status === 'donated') {
      const donor = state.donors.find(d => d.id === match.donorId);
      const req = state.requests.find(r => r.id === match.requestId);
      
      // Update donor last donation date
      if (donor) {
        updateDonor(donor.id, { lastDonation: new Date().toISOString().split('T')[0] });
        
        // AUTO-ADD TO INVENTORY
        const newUnit: BloodUnit = {
          id: Date.now() + Math.random(),
          unitCode: `BLD-IND-${Math.floor(1000 + Math.random() * 9000)}`,
          bloodGroup: donor.bloodGroup,
          donorId: donor.id,
          volumeMl: 450,
          collectedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString(),
          storageLocation: "Fridge A / Shelf 1",
          status: "available",
          createdAt: new Date().toISOString()
        };
        addBloodUnit(newUnit);
      }

      // Mark Request Done
      updateRequest(match.requestId, { status: 'completed' });
      triggerConfetti();
    } else if (match.status === 'contacted') {
      const req = state.requests.find(r => r.id === match.requestId);
      if (req && req.status === 'pending') {
        updateRequest(match.requestId, { status: 'matched' });
      }
    }
  };

  const addBloodUnit = (unit: BloodUnit) => {
    const updated = [unit, ...state.inventory];
    setState(prev => ({ ...prev, inventory: updated }));
    localDb.saveInventory(updated);
  };

  const updateBloodUnit = (id: number, updates: Partial<BloodUnit>) => {
    const updated = state.inventory.map(u => u.id === id ? { ...u, ...updates } : u);
    setState(prev => ({ ...prev, inventory: updated }));
    localDb.saveInventory(updated);
  };

  const renderContent = () => {
    if (path === '/') return <Dashboard state={state} setPath={setPath} />;
    if (path === '/donors') return <DonorManagement state={state} addDonor={addDonor} updateDonor={updateDonor} />;
    if (path === '/requests') return <RequestManagement state={state} addRequest={addRequest} updateRequest={updateRequest} setPath={setPath} />;
    if (path === '/inventory') return <InventoryManagement state={state} addBloodUnit={addBloodUnit} updateBloodUnit={updateBloodUnit} />;
    
    const matchMatch = path.match(/^\/requests\/(\d+)\/matches$/);
    if (matchMatch) {
      return <MatchFinder requestId={parseInt(matchMatch[1])} state={state} addMatch={addMatch} updateBloodUnit={updateBloodUnit} setPath={setPath} />;
    }

    return <div className="p-20 text-center font-black text-slate-900">404 - Page Not Found</div>;
  };

  return (
    <div className="min-h-screen no-scrollbar">
      <Navbar currentPath={path} setPath={setPath} />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-100 py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
               <DropletIcon size={20} color="white" />
            </div>
            <span className="font-black text-slate-900 text-lg">BloodLife India</span>
          </div>
          <p className="font-bold uppercase tracking-widest text-[10px]">© 2024 VITAL SYSTEMS • SAVING LIVES DROP BY DROP</p>
        </div>
      </footer>
    </div>
  );
};

const DropletIcon = ({ size, color }: { size: number, color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
);

export default App;
