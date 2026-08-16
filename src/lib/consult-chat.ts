import { LANGUAGES, type LanguageCode } from "@/lib/wholesome-data";

export type SenderRole = "PATIENT" | "DOCTOR";

export type ConsultMessage = {
  id: string;
  senderRole: SenderRole;
  senderName: string;
  kind: "text" | "voice" | "file";
  rawText?: string;
  translatedText?: string;
  sourceLang: LanguageCode;
  durationSeconds?: number;
  fileName?: string;
  fileSizeKb?: number;
  createdAt: number;
};

/** Demo translation memory standing in for Google STT + Translation. */
const PHRASEBOOK: Record<string, string> = {
  "ina jin ciwon kirji": "I feel chest pain",
  "ina jin sanyi": "I feel feverish and cold",
  "ciwon kai": "headache",
  "mo ni orififo": "I have a headache",
  "inu mi n run": "my abdomen hurts",
  "obi na-alu m": "my chest is hurting",
  "j'ai mal a la poitrine": "I have chest pain",
  "me duele el pecho": "I have chest pain",
};

export function translateToClinicalEnglish(text: string, lang: LanguageCode) {
  if (lang === "en") return text;
  const normalized = text.trim().toLowerCase();
  for (const [key, value] of Object.entries(PHRASEBOOK)) {
    if (normalized.includes(key)) {
      return `${value} — translated from ${LANGUAGES[lang]} (confidence 0.94).`;
    }
  }
  return `[${LANGUAGES[lang]} → Clinical English] ${text}`;
}

const STORAGE_KEY = "wholesome.consult.thread.v1";

export const SEED_THREAD: ConsultMessage[] = [
  {
    id: "msg-1",
    senderRole: "DOCTOR",
    senderName: "Dr. Folake Adeyemi",
    kind: "text",
    rawText: "Good morning Aisha. I have reviewed your intake. Is the chest pain present right now?",
    sourceLang: "en",
    createdAt: 1,
  },
  {
    id: "msg-2",
    senderRole: "PATIENT",
    senderName: "Aisha Kabir",
    kind: "text",
    rawText: "Ina jin ciwon kirji yanzu, musamman idan na yi numfashi mai zurfi.",
    translatedText:
      "I feel chest pain — translated from Hausa (confidence 0.94). Worse on deep inspiration.",
    sourceLang: "ha",
    createdAt: 2,
  },
  {
    id: "msg-3",
    senderRole: "PATIENT",
    senderName: "Aisha Kabir",
    kind: "voice",
    rawText: "Ina jin sanyi da dare, kuma zuciyata na bugawa da sauri.",
    translatedText:
      "I feel feverish and cold — translated from Hausa (confidence 0.94). Reports nocturnal palpitations.",
    sourceLang: "ha",
    durationSeconds: 18,
    createdAt: 3,
  },
  {
    id: "msg-4",
    senderRole: "PATIENT",
    senderName: "Aisha Kabir",
    kind: "file",
    fileName: "home-bp-log-august.png",
    fileSizeKb: 412,
    sourceLang: "en",
    createdAt: 4,
  },
];

type Listener = (messages: ConsultMessage[]) => void;

let thread: ConsultMessage[] = SEED_THREAD;
let hydrated = false;
const listeners = new Set<Listener>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(thread));
  } catch {
    /* storage unavailable — in-memory only */
  }
}

function emit() {
  for (const listener of listeners) listener(thread);
}

/** Call from useEffect. Loads persisted thread and mirrors other open tabs. */
export function hydrateThread() {
  if (typeof window === "undefined" || hydrated) return;
  hydrated = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ConsultMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        thread = parsed;
        emit();
      }
    }
  } catch {
    /* ignore malformed cache */
  }
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      thread = JSON.parse(event.newValue) as ConsultMessage[];
      emit();
    } catch {
      /* ignore */
    }
  });
}

export function subscribeThread(listener: Listener) {
  listeners.add(listener);
  listener(thread);
  return () => listeners.delete(listener);
}

export function getThread() {
  return thread;
}

export function appendMessage(input: Omit<ConsultMessage, "id" | "createdAt">) {
  const message: ConsultMessage = {
    ...input,
    id: `msg-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    createdAt: Date.now(),
  };
  if (message.rawText && message.sourceLang !== "en" && !message.translatedText) {
    message.translatedText = translateToClinicalEnglish(message.rawText, message.sourceLang);
  }
  thread = [...thread, message];
  persist();
  emit();
  return message;
}