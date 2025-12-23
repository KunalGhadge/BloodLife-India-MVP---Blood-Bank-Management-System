
import { AppState, Donor, BloodRequest, Match, BloodUnit } from '../types';

const KEYS = {
  DONORS: 'bloodlife_donors',
  REQUESTS: 'bloodlife_requests',
  MATCHES: 'bloodlife_matches',
  INVENTORY: 'bloodlife_inventory'
};

const SEED_DONORS: Donor[] = [
  { id: 1, name: "Aarav Sharma", phone: "9876543210", bloodGroup: "O+", city: "Mumbai", area: "Andheri", lastDonation: "2023-11-15", isActive: true, createdAt: new Date().toISOString() },
  { id: 2, name: "Priya Patel", phone: "8877665544", bloodGroup: "A-", city: "Ahmedabad", area: "Satellite", lastDonation: "2024-01-20", isActive: true, createdAt: new Date().toISOString() },
  { id: 3, name: "Vikram Singh", phone: "7766554433", bloodGroup: "B+", city: "Delhi", area: "Rohini", lastDonation: "2023-12-05", isActive: true, createdAt: new Date().toISOString() },
  { id: 4, name: "Ananya Iyer", phone: "9988776655", bloodGroup: "AB+", city: "Chennai", area: "Adyar", isActive: true, createdAt: new Date().toISOString() },
  { id: 5, name: "Rahul Deshmukh", phone: "9123456789", bloodGroup: "O-", city: "Pune", area: "Kothrud", lastDonation: "2023-08-10", isActive: true, createdAt: new Date().toISOString() },
];

const SEED_REQUESTS: BloodRequest[] = [
  { id: 1, patientName: "Rajesh Kumar", hospital: "Apollo Hospital", bloodGroup: "O+", unitsNeeded: 2, city: "Mumbai", area: "Bandra", urgency: "high", contactPhone: "9898989898", status: "pending", createdAt: new Date().toISOString() },
  { id: 2, patientName: "Sita Devi", hospital: "AIIMS", bloodGroup: "O-", unitsNeeded: 1, city: "Delhi", area: "Saket", urgency: "medium", contactPhone: "8787878787", status: "pending", createdAt: new Date().toISOString() },
];

const generateExpiry = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const SEED_INVENTORY: BloodUnit[] = [
  { id: 101, unitCode: "BLD-IND-0001", bloodGroup: "O+", volumeMl: 450, collectedAt: new Date().toISOString(), expiresAt: generateExpiry(42), storageLocation: "Fridge A / Shelf 1", status: "available", createdAt: new Date().toISOString() },
  { id: 102, unitCode: "BLD-IND-0002", bloodGroup: "O+", volumeMl: 450, collectedAt: new Date().toISOString(), expiresAt: generateExpiry(42), storageLocation: "Fridge A / Shelf 1", status: "available", createdAt: new Date().toISOString() },
  { id: 103, unitCode: "BLD-IND-0003", bloodGroup: "A-", volumeMl: 350, collectedAt: new Date().toISOString(), expiresAt: generateExpiry(5), storageLocation: "Fridge B / Shelf 2", status: "available", createdAt: new Date().toISOString() },
  { id: 104, unitCode: "BLD-IND-0004", bloodGroup: "B+", volumeMl: 450, collectedAt: new Date().toISOString(), expiresAt: generateExpiry(-2), storageLocation: "Fridge C / Shelf 1", status: "available", createdAt: new Date().toISOString() },
];

export const getStoredData = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

export const setStoredData = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};

export const initializeDb = () => {
  const donors = getStoredData<Donor[]>(KEYS.DONORS, []);
  const requests = getStoredData<BloodRequest[]>(KEYS.REQUESTS, []);
  const inventory = getStoredData<BloodUnit[]>(KEYS.INVENTORY, []);
  
  if (donors.length === 0) setStoredData(KEYS.DONORS, SEED_DONORS);
  if (requests.length === 0) setStoredData(KEYS.REQUESTS, SEED_REQUESTS);
  if (inventory.length === 0) setStoredData(KEYS.INVENTORY, SEED_INVENTORY);
};

export const localDb = {
  getDonors: () => getStoredData<Donor[]>(KEYS.DONORS, []),
  saveDonors: (donors: Donor[]) => setStoredData(KEYS.DONORS, donors),
  getRequests: () => getStoredData<BloodRequest[]>(KEYS.REQUESTS, []),
  saveRequests: (requests: BloodRequest[]) => setStoredData(KEYS.REQUESTS, requests),
  getMatches: () => getStoredData<Match[]>(KEYS.MATCHES, []),
  saveMatches: (matches: Match[]) => setStoredData(KEYS.MATCHES, matches),
  getInventory: () => getStoredData<BloodUnit[]>(KEYS.INVENTORY, []),
  saveInventory: (units: BloodUnit[]) => setStoredData(KEYS.INVENTORY, units),
};
