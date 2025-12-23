
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type Urgency = "low" | "medium" | "high";

export type RequestStatus = "pending" | "matched" | "completed";

export type MatchStatus = "contacted" | "donated" | "declined";

export type BloodUnitStatus = "available" | "reserved" | "used" | "discarded";

export interface Donor {
  id: number;
  name: string;
  phone: string;
  bloodGroup: BloodGroup;
  city: string;
  area: string;
  lastDonation?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BloodRequest {
  id: number;
  patientName: string;
  hospital?: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  city: string;
  area: string;
  urgency: Urgency;
  contactPhone: string;
  status: RequestStatus;
  createdAt: string;
}

export interface Match {
  id: number;
  requestId: number;
  donorId: number;
  status: MatchStatus;
  createdAt: string;
}

export interface BloodUnit {
  id: number;
  unitCode: string;
  bloodGroup: BloodGroup;
  donorId?: number | null;
  volumeMl: number;
  collectedAt: string;
  expiresAt: string;
  storageLocation: string;
  status: BloodUnitStatus;
  reservedForRequestId?: number | null;
  createdAt: string;
}

export interface AppState {
  donors: Donor[];
  requests: BloodRequest[];
  matches: Match[];
  inventory: BloodUnit[];
}
