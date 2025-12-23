
# 🩸 BloodLife MVP

> **Saving Lives, Drop by Drop.**
> A comprehensive blood donation management system designed to connect donors, hospitals, and recipients efficiently.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61dafb.svg?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff.svg?style=flat&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?style=flat&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?style=flat&logo=typescript)

BloodLife MVP is a modern, responsive web application built to streamline the blood donation process. It handles everything from donor registration and request management to smart matching and inventory tracking, ensuring that life-saving blood reaches those in need as quickly as possible.

---

## ✨ Key Features

This application includes a suite of powerful tools designed for blood banks and administrators:

### 📊 **Interactive Dashboard**
Get a real-time overview of the system's health.
- **Key Metrics:** Track total donors, active requests, successful matches, and inventory turnover.
- **Visual Analytics:** Beautiful charts visualizing blood group distribution and donation trends (powered by Recharts).

### 🤝 **Donor Management**
A centralized database for all innovative heroes.
- **Registration:** Easy onboarding for new donors.
- **Profile Management:** Track blood groups, contact info, and donation eligibility.
- **History:** Maintain a record of past donations to ensure safety and compliance.

### 🚑 **Request & Match System**
The heart of the application.
- **Request Log:** Hospitals and recipients can log urgent requirements.
- **Smart Matching:** The **MatchFinder** module automatically identifies compatible donors based on blood group rules and availability.
- **Status Tracking:** Monitor requests from 'Pending' to 'matched' and finally 'Completed'.

### 📦 **Inventory Control**
Manage the blood bank's physical stock.
- **Unit Tracking:** Monitor individual blood units with unique IDs.
- **Expiry Management:** Auto-calculated expiration dates (42 days for WB) to prevent waste.
- **Storage Locations:** Know exactly which fridge and shelf contains the needed unit.

### 💾 **Local-First Architecture**
- **Zero-Setup Persistence:** Uses `localStorage` to save all data. No backend configuration is required to start testing or demoing the app immediately.
- **Auto-Seeding:** The app comes pre-populated with sample data (Donors, Requests, Inventory) so you can see it in action right away.

---

## 🛠️ Tech Stack

BloodLife is built with a modern, performance-oriented stack:

- **Core:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) for lightning-fast development and rendering.
- **Language:** [TypeScript](https://www.typescriptlang.org/) for type-safe, maintainable code.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a sleek, custom UI.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for smooth page transitions and interactive elements.
- **Icons:** [Lucide React](https://lucide.dev/) for clean, consistent iconography.
- **Charts:** [Recharts](https://recharts.org/) for data visualization.
- **Effects:** `canvas-confetti` for celebrating successful donations!

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bloodlife-mvp.git
   cd bloodlife-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the URL shown in your terminal).

---

## 📂 Project Structure

A quick guide to navigating the codebase:

```
bloodlife-mvp/
├── src/
│   ├── components/
│   │   ├── layout/         # Navbar and shell components
│   │   ├── ui/             # Reusable UI elements (e.g., GlassCard)
│   │   ├── Dashboard.tsx   # Main overview page
│   │   ├── DonorManagement.tsx
│   │   ├── RequestManagement.tsx
│   │   ├── MatchFinder.tsx # Logic for finding donor-patient matches
│   │   └── InventoryManagement.tsx
│   ├── lib/
│   │   └── localDb.ts      # LocalStorage wrapper & data seeding logic
│   ├── types.ts            # TypeScript interfaces (Donor, BloodRequest, etc.)
│   ├── App.tsx             # Main router and state manager
│   └── main.tsx            # Entry point
├── public/                 # Static assets
└── package.json            # Project dependencies
```

---

## 🛡️ Usage Policy

This is an **MVP (Minimum Viable Product)** designed for demonstration and development purposes.
- **Data Persistence:** Data is stored in your browser's LocalStorage. clearing your browser cache will reset the application to its initial state.
- **Security:** As a client-side only app, this should not be used for storing sensitive real-world medical data without integrating a secure backend.

---

<div align="center">
  <p>Built with ❤️ by the BloodLife Team</p>
  <p>© 2024 Vital Systems • Saving Lives Drop by Drop</p>
</div>
