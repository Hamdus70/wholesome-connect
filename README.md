# Wholesome Connect

# PROMPT: BUILD "WHOLESOME HEALTH" TELEHEALTH & HOSPITAL EMR ECOSYSTEM

## 1. PROJECT PERSONA & ROLE INSTRUCTIONS

You are an Elite Principal Full-Stack Cloud Architect and Senior Health-Tech Software Engineer.

Your task is to build a production-grade, enterprise-ready, cross-platform Telehealth and Mini-EMR ecosystem named **"Wholesome Health"**.

The application must be architected as a modular Monorepo containing:

1. **Public Marketing & Patient Portal:** `wholesomehealth.com` (Hospital branding, doctor discovery, booking, multimodal intake, and patient telehealth interface).

2. **Clinical EMR Portal:** `emr.wholesomehealth.com` (Specialist workstation, incoming consultation calls, real-time multilingual translation desk, SOAP charting, lab requisitions, and e-prescriptions).

3. **Cross-Platform Mobile App:** React Native / Expo codebase with 100% feature parity for iOS and Android.

Target Concurrency: **10,000+ simultaneous users**. High resilience, low latency, and zero-race-condition slot booking.

---

## 2. PRODUCTION TECH STACK & INFRASTRUCTURE

- **Frontend & Web:** Next.js 14+ (App Router, Server Actions, TypeScript, Tailwind CSS, Shadcn UI, Lucide Icons).

- **Mobile Engine:** React Native (Expo SDK 51+, TypeScript) with native WebRTC modules and VoIP Push Notifications (APNs + FCM).

- **Backend Architecture:** Node.js with NestJS (Fastify adapter, Microservices-ready, native WebSockets/Socket.IO gateway).

- **Real-Time Video/Audio Engine:** LiveKit SFU (WebRTC for high-definition low-latency video/voice calls).

- **Primary Database:** PostgreSQL with Prisma ORM (Connection pooling via PgBouncer, ACID-compliant medical files).

- **Cache & Distributed Locking:** Redis Cluster (Distributed locks via `Redlock` algorithm for collision-free booking, session management, and rate limiting).

- **Object Storage:** Cloudflare R2 / AWS S3 (AES-256 Server-Side Encryption with presigned URL streaming for audio notes, videos, and PDFs).

- **Multilingual AI Pipeline:** Google Cloud Speech-to-Text API (Chirp v2) + Google Cloud Translation API (Hausa, Yoruba, Igbo, Spanish, French, English).

- **Payment Gateways:** Paystack, Flutterwave, and Stripe webhook reconciliation.

- **Transactional Comms:** Resend / SendGrid (Email OTP, Lab Requisition PDFs), Termii / Twilio (SMS).

---

## 3. CORE FUNCTIONAL SPECIFICATIONS & WORKFLOWS

### A. Authentication, Security & Anti-Fraud

1. **Email OTP Authentication:** Sign up / Login via secure 6-digit numeric OTP sent via email (5-minute expiration).

2. **Anti-Abuse Layer:** Redis-backed rate limiter on authentication endpoints. Track client IP address and user-agent to detect and block automated multi-account spamming.

3. **Role-Based Access Control (RBAC):** Strict role middleware: `PATIENT`, `DOCTOR`, `LAB_ADMIN`, `PHARMACY_ADMIN`, `SUPER_ADMIN`.

### B. Intelligent Scheduling & Concurrency Locking (Anti-Collision Engine)

1. **Duration Tiers:** Support consultations of 30 mins, 60 mins, 90 mins, 2 hours, and 5 hours.

2. **Distributed Slot Lock:**

   - When a patient selects Doctor $D_1$ at Time $T$, acquire a Redis lock: `SET slot:lock:{doctor_id}:{start_epoch} {patient_id} NX EX 300`.

   - If slot is occupied: Promptly reject, fetch available doctors of identical specialty, and suggest alternative slots (e.g., +5 minutes after occupied slot).

   - Upon successful payment verification webhook, commit booking to PostgreSQL and mark status as `CONFIRMED`.

### C. Live Telehealth Call Engine & Automated Timers

1. **Call Initiation:** The Patient dials the doctor from their dashboard. Socket.IO emits an `incoming_call` event with audio ringtone to the Doctor's EMR desk.

2. **Active Call Session:**

   - Connect both peers via LiveKit WebRTC (Audio/Video).

   - Server-authoritative countdown timer synchronized via WebSockets.

3. **Automated Reminders & Hard-Stop:**

   - **At $T - 10$ minutes:** Play an audio alert chime and display a warning banner on both screens: *"10 minutes remaining in consultation."*

   - **At $T - 5$ minutes:** Display a high-urgency red badge: *"5 minutes remaining. Conclude clinical assessment."*

   - **At $T = 0$ minutes:** Automatically terminate WebRTC peer connections, close the room, and redirect patient to summary and doctor to post-consultation file finalize.

### D. Multimodal Intake & Multilingual AI Translation Desk

1. **Patient Intake Dossier:** Patients can record audio voice notes, upload video clips, write text, and attach lab PDFs prior to consultation.

2. **AI Translation Pipeline:**

   - When a patient submits a voice note or text in **Hausa (`ha`), Yoruba (`yo`), Igbo (`ig`), Spanish (`es`), or French (`fr`)**, the system transcribes and translates the complaint into the doctor's preferred clinical language (e.g., English).

   - Doctor's desk must render the original audio playback, raw native transcript, and translated clinical English side-by-side.

### E. Mini-EMR, SOAP Notes, Lab & Pharmacy Routing

1. **SOAP Clinical Charting:** Integrated editor in doctor's call view: Subjective, Objective, Assessment, and Plan.

2. **Hybrid Diagnostic Lab Requisitions:**

   - If target lab is registered on portal: Send JSON payload directly to lab's EMR inbox.

   - If lab is external/unregistered: Background worker generates an official branded PDF requisition form and dispatches it via SMTP to the lab's booking email.

3. **E-Prescriptions:** Structured medication builder (Drug Name, Dosage, Frequency, Duration, Special Instructions) paired with mapped partner pharmacy pickup/delivery locations.

---

## 4. DATABASE SCHEMA (PRISMA ORM DEFINITION)

Generate a clean, fully indexed `schema.prisma` file containing:

- `User` (id, email, passwordHash, role, ipAddress, isVerified, createdAt)

- `DoctorProfile` (id, userId, specialty, licenseNumber, hourlyRate, isOnline, isAvailable)

- `PatientProfile` (id, userId, fullName, dob, gender, bloodGroup, allergies)

- `Appointment` (id, patientId, doctorId, startTime, endTime, durationMinutes, status, roomToken, paymentStatus)

- `IntakeDossier` (id, appointmentId, textComplaint, audioVoiceUrl, videoUrl, documentUrls, rawLanguage, translatedText)

- `SoapNote` (id, appointmentId, subjective, objective, assessment, plan, isFinalized)

- `LabRequisition` (id, appointmentId, labId, testsJson, status, requisitionPdfUrl)

- `Prescription` (id, appointmentId, pharmacyId, medicationsJson, status, instructions)

- `PartnerDirectory` (id, type [LAB/PHARMACY], name, email, address, hasPortalAccess)

---

## 5. UI/UX DESIGN SYSTEM & COLOR PALETTE

- **Primary Color:** Deep Sapphire Medical Blue (`#0F4C81`)

- **Accent Color:** Emerald Teal (`#0D9488`)

- **Background:** Crisp Soft Slate (`#F8FAFC`) / Pure White (`#FFFFFF`)

- **Urgent / Timer Elements:** Crimson Rose (`#E11D48`)

- **Typography:** Inter or Plus Jakarta Sans

- **Layouts:** High-contrast status badges, accessible dark/light modes, floating Picture-in-Picture (PiP) video consult layout with side-drawer EMR tools.

---

## 6. DELIVERABLES REQUIRED IN YOUR RESPONSE

1. **Complete Database Schema:** Fully detailed `schema.prisma` with indexes, relations, and enums.

2. **Backend Concurrency & Slot-Locking Service:** NestJS/TypeScript service implementing Redis `SETNX` distributed lock with slot availability checks.

3. **Multilingual AI Audio/Text Translation Service:** NestJS service interfacing with Google Cloud Speech-to-Text and Translation APIs.

4. **Interactive Doctor Consultation Desk Frontend:** Fully functional Next.js 14+ React component with LiveKit video container, synchronized countdown timer ($T-10$, $T-5$, hard-stop), multimodal audio intake player, side-by-side translation viewer, and tabbed SOAP/Lab/Prescription drawers.

5. **Clear Step-by-Step Deployment Guide:** Directory structure, environment variables, and Docker Compose configuration (PostgreSQL, Redis, LiveKit).

Generate clean, robust, type-safe, and production-ready code with no placeholders.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a8c630dd-9801-4877-b678-075e77b611dc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
