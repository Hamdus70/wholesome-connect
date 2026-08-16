export type Role = "PATIENT" | "DOCTOR" | "LAB_ADMIN" | "PHARMACY_ADMIN" | "SUPER_ADMIN";

export type LanguageCode = "en" | "ha" | "yo" | "ig" | "es" | "fr";

export const LANGUAGES: Record<LanguageCode, string> = {
  en: "English",
  ha: "Hausa",
  yo: "Yoruba",
  ig: "Igbo",
  es: "Spanish",
  fr: "French",
};

export const DURATION_TIERS = [
  { minutes: 30, label: "30 minutes", multiplier: 0.5 },
  { minutes: 60, label: "1 hour", multiplier: 1 },
  { minutes: 90, label: "1 hour 30 minutes", multiplier: 1.5 },
  { minutes: 120, label: "2 hours", multiplier: 2 },
  { minutes: 300, label: "5 hours (extended review)", multiplier: 5 },
] as const;

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  licenseNumber: string;
  hourlyRate: number;
  isOnline: boolean;
  languages: LanguageCode[];
  rating: number;
  consults: number;
  initials: string;
  bio: string;
  /** Locked slots (ISO minutes offset from today 08:00 in 30 min steps) */
  bookedSlots: string[];
};

/** Deterministic slot grid so server and client render identically. */
export function slotGrid(): string[] {
  const slots: string[] = [];
  for (let h = 8; h < 18; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

export const DOCTORS: Doctor[] = [
  {
    id: "dr-adeyemi",
    name: "Dr. Folake Adeyemi",
    specialty: "Cardiology",
    licenseNumber: "MDCN/CA/71204",
    hourlyRate: 45000,
    isOnline: true,
    languages: ["en", "yo", "fr"],
    rating: 4.9,
    consults: 1284,
    initials: "FA",
    bio: "Interventional cardiologist focused on hypertension management and post-infarct rehabilitation.",
    bookedSlots: ["09:00", "09:30", "12:00", "15:30"],
  },
  {
    id: "dr-bello",
    name: "Dr. Ibrahim Bello",
    specialty: "Cardiology",
    licenseNumber: "MDCN/CA/66018",
    hourlyRate: 38000,
    isOnline: true,
    languages: ["en", "ha"],
    rating: 4.8,
    consults: 964,
    initials: "IB",
    bio: "Preventive cardiology, arrhythmia screening and remote Holter interpretation.",
    bookedSlots: ["08:30", "13:00"],
  },
  {
    id: "dr-okonkwo",
    name: "Dr. Chidi Okonkwo",
    specialty: "Internal Medicine",
    licenseNumber: "MDCN/IM/49913",
    hourlyRate: 30000,
    isOnline: false,
    languages: ["en", "ig"],
    rating: 4.7,
    consults: 2210,
    initials: "CO",
    bio: "Chronic disease management, diabetes titration and complex differential diagnosis.",
    bookedSlots: ["10:00", "10:30", "11:00"],
  },
  {
    id: "dr-santos",
    name: "Dr. Elena Santos",
    specialty: "Paediatrics",
    licenseNumber: "MDCN/PD/33471",
    hourlyRate: 33000,
    isOnline: true,
    languages: ["en", "es"],
    rating: 5,
    consults: 780,
    initials: "ES",
    bio: "Neonatal and childhood respiratory care, growth monitoring and vaccination planning.",
    bookedSlots: ["14:00", "16:30"],
  },
  {
    id: "dr-nwosu",
    name: "Dr. Amara Nwosu",
    specialty: "Obstetrics & Gynaecology",
    licenseNumber: "MDCN/OG/58120",
    hourlyRate: 42000,
    isOnline: true,
    languages: ["en", "ig", "fr"],
    rating: 4.9,
    consults: 1502,
    initials: "AN",
    bio: "Antenatal telemonitoring, fertility workups and high-risk pregnancy co-management.",
    bookedSlots: ["08:00", "17:00"],
  },
  {
    id: "dr-lawal",
    name: "Dr. Musa Lawal",
    specialty: "Dermatology",
    licenseNumber: "MDCN/DM/28844",
    hourlyRate: 28000,
    isOnline: false,
    languages: ["en", "ha", "yo"],
    rating: 4.6,
    consults: 640,
    initials: "ML",
    bio: "Teledermatology triage for eczema, acne and pigmentary disorders using image intake.",
    bookedSlots: ["11:30", "12:30"],
  },
];

export const SPECIALTIES = Array.from(new Set(DOCTORS.map((d) => d.specialty)));

export function priceFor(doctor: Doctor, minutes: number) {
  const tier = DURATION_TIERS.find((t) => t.minutes === minutes) ?? DURATION_TIERS[1];
  return Math.round(doctor.hourlyRate * tier.multiplier);
}

export const naira = (value: number) =>
  `\u20a6${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

/** Next free slot after a locked one, in 5-minute stagger as per anti-collision rules. */
export function suggestAfter(slot: string) {
  const [h = 0, m = 0] = slot.split(":").map(Number);
  const total = h * 60 + m + 5;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export type IntakeItem = {
  id: string;
  kind: "audio" | "video" | "text" | "document";
  label: string;
  language: LanguageCode;
  durationSeconds?: number;
  rawTranscript: string;
  translated: string;
};

export const INTAKE_DOSSIER: IntakeItem[] = [
  {
    id: "voice-1",
    kind: "audio",
    label: "Voice note — presenting complaint",
    language: "ha",
    durationSeconds: 74,
    rawTranscript:
      "Ina jin ciwon kirji tun kwana uku, yana kara tsanani idan na hau matakala. Ina kuma jin karancin numfashi da dare.",
    translated:
      "Patient reports central chest pain for three days, worsening on stair climbing. Also describes nocturnal shortness of breath.",
  },
  {
    id: "voice-2",
    kind: "audio",
    label: "Voice note — medication history",
    language: "yo",
    durationSeconds: 41,
    rawTranscript:
      "Mo n mu oogun eje riru lojoojumo, sugbon mo ti gbagbe re fun ojo meji seyin.",
    translated:
      "Patient takes a daily antihypertensive but missed doses for the last two days.",
  },
  {
    id: "text-1",
    kind: "text",
    label: "Typed symptom summary",
    language: "fr",
    rawTranscript:
      "Douleur thoracique oppressive, irradiant vers le bras gauche, accompagnee de sueurs.",
    translated:
      "Constricting chest pain radiating to the left arm, accompanied by diaphoresis.",
  },
  {
    id: "doc-1",
    kind: "document",
    label: "Lipid panel — Sapphire Diagnostics (PDF)",
    language: "en",
    rawTranscript: "Total cholesterol 6.4 mmol/L, LDL 4.3 mmol/L, HDL 0.9 mmol/L, TG 2.6 mmol/L.",
    translated: "Total cholesterol 6.4 mmol/L, LDL 4.3 mmol/L, HDL 0.9 mmol/L, TG 2.6 mmol/L.",
  },
];

export const PARTNER_DIRECTORY = [
  { id: "lab-sapphire", type: "LAB" as const, name: "Sapphire Diagnostics", email: "bookings@sapphirediagnostics.ng", address: "12 Awolowo Rd, Ikoyi, Lagos", hasPortalAccess: true },
  { id: "lab-clinix", type: "LAB" as const, name: "Clinix Reference Lab", email: "requisitions@clinixlab.com", address: "4 Ahmadu Bello Way, Abuja", hasPortalAccess: false },
  { id: "lab-medlite", type: "LAB" as const, name: "MedLite Pathology", email: "orders@medlite.africa", address: "88 Aba Rd, Port Harcourt", hasPortalAccess: false },
  { id: "pharm-wellcare", type: "PHARMACY" as const, name: "Wellcare Pharmacy (Lekki)", email: "dispense@wellcare.ng", address: "Admiralty Way, Lekki Phase 1", hasPortalAccess: true },
  { id: "pharm-greenlife", type: "PHARMACY" as const, name: "Greenlife Chemists", email: "orders@greenlife.ng", address: "3 Zik Ave, Enugu", hasPortalAccess: true },
];

export const LAB_TEST_CATALOG = [
  "Troponin I (high sensitivity)",
  "Full Blood Count",
  "Lipid Profile",
  "Fasting Blood Glucose",
  "HbA1c",
  "Electrolytes, Urea & Creatinine",
  "Chest X-Ray (PA)",
  "Echocardiogram",
  "Thyroid Function Test",
];

export type Medication = {
  id: string;
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};
