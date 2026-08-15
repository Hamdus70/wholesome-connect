import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileAudio,
  FileText,
  FlaskConical,
  Languages,
  Lock,
  Pill,
  ShieldCheck,
  Star,
  Timer,
  Video,
} from "lucide-react";
import heroImage from "@/assets/hero-telehealth.jpg";
import { SiteHeader } from "@/components/wholesome/site-header";
import { BookingDialog } from "@/components/wholesome/booking-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DOCTORS,
  INTAKE_DOSSIER,
  LANGUAGES,
  PARTNER_DIRECTORY,
  SPECIALTIES,
  naira,
  type Doctor,
} from "@/lib/wholesome-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wholesome Health — Telehealth Consultations & Hospital EMR" },
      {
        name: "description",
        content:
          "Book verified specialists, submit voice, video and lab intake in Hausa, Yoruba, Igbo, Spanish or French, and consult by secure HD video with e-prescriptions.",
      },
      { property: "og:title", content: "Wholesome Health — Telehealth & Hospital EMR" },
      {
        property: "og:description",
        content:
          "Collision-free specialist booking, multilingual AI intake translation and a full clinical EMR desk in one platform.",
      },
    ],
  }),
  component: Home,
});

const FEATURES = [
  {
    icon: Lock,
    title: "Collision-free booking",
    body: "Distributed slot locks hold your appointment for five minutes while payment clears — no double bookings, ever.",
  },
  {
    icon: Languages,
    title: "Six-language intake",
    body: "Speak in Hausa, Yoruba, Igbo, Spanish or French. Your doctor reads a clinical English translation beside your original audio.",
  },
  {
    icon: Timer,
    title: "Timed consultations",
    body: "30-minute to 5-hour tiers with synchronized reminders at 10 and 5 minutes, then a clean automatic close-out.",
  },
  {
    icon: FlaskConical,
    title: "Labs & pharmacy routing",
    body: "Requisitions reach partner labs instantly, or arrive as a branded PDF by email — prescriptions route to a pharmacy near you.",
  },
];

function Home() {
  const [specialty, setSpecialty] = useState<string>("All");
  const [selected, setSelected] = useState<Doctor | null>(null);

  const doctors = useMemo(
    () => (specialty === "All" ? DOCTORS : DOCTORS.filter((d) => d.specialty === specialty)),
    [specialty],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="bg-hero-gradient relative overflow-hidden text-primary-foreground">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div className="animate-rise">
              <Badge
                variant="outline"
                className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
              >
                <ShieldCheck className="size-3.5" /> Licensed hospital network
              </Badge>
              <h1 className="mt-5 font-display text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-6xl">
                Hospital-grade care, one secure call away.
              </h1>
              <p className="mt-5 max-w-xl text-base/relaxed text-primary-foreground/80 sm:text-lg/relaxed">
                Wholesome Health connects you to verified specialists over encrypted HD video —
                with multilingual intake, live clinical charting, lab requisitions and
                e-prescriptions handled in the same consultation.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" variant="secondary" className="gap-2">
                  <a href="#specialists">
                    Find your specialist <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link to="/emr">Enter clinician desk</Link>
                </Button>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-primary-foreground/20 pt-6">
                {[
                  ["10,000+", "concurrent sessions"],
                  ["6", "supported languages"],
                  ["< 200ms", "video latency"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="font-display text-2xl font-bold">{value}</dt>
                    <dd className="text-xs text-primary-foreground/70">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="shadow-glow overflow-hidden rounded-3xl border border-primary-foreground/15">
                <img
                  src={heroImage}
                  alt="Doctor consulting a patient over secure video on a tablet"
                  width={1280}
                  height={1024}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 left-6 hidden rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-card sm:block">
                <p className="text-xs font-semibold text-muted-foreground">Live consultation</p>
                <p className="mt-1 flex items-center gap-2 font-display text-lg font-bold">
                  <span className="size-2 animate-pulse rounded-full bg-destructive" /> 47:12
                  remaining
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="shadow-card border-border/70">
                <CardHeader>
                  <span className="bg-accent-gradient flex size-10 items-center justify-center rounded-xl text-accent-foreground">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-3 text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm/relaxed text-muted-foreground">{body}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="specialists" className="bg-card/60 border-y border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-bold">Available specialists</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Every clinician is licence-verified. Occupied slots are locked in real time.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["All", ...SPECIALTIES].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSpecialty(item)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                      specialty === item
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <Card key={doctor.id} className="shadow-card flex flex-col border-border/70">
                  <CardHeader className="flex-row items-start gap-4">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                        {doctor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="flex items-center gap-1.5 text-base">
                        {doctor.name}
                        <BadgeCheck className="size-4 shrink-0 text-accent" />
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    </div>
                    <Badge
                      variant={doctor.isOnline ? "default" : "secondary"}
                      className={doctor.isOnline ? "bg-success text-success-foreground" : ""}
                    >
                      {doctor.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <p className="text-sm/relaxed text-muted-foreground">{doctor.bio}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {doctor.languages.map((code) => (
                        <Badge key={code} variant="outline" className="text-xs">
                          {LANGUAGES[code]}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Star className="size-4 fill-warning text-warning" />
                        {doctor.rating.toFixed(1)}
                        <span className="text-muted-foreground">
                          ({doctor.consults.toLocaleString()})
                        </span>
                      </span>
                      <span className="font-display font-bold">
                        {naira(doctor.hourlyRate)}
                        <span className="text-xs font-normal text-muted-foreground">/hr</span>
                      </span>
                    </div>
                    <Button className="mt-auto gap-2" onClick={() => setSelected(doctor)}>
                      <Video className="size-4" /> Book consultation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="intake" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Badge variant="outline" className="gap-1.5">
                <Languages className="size-3.5 text-accent" /> AI translation desk
              </Badge>
              <h2 className="mt-4 font-display text-3xl font-bold">
                Describe your symptoms in your own language.
              </h2>
              <p className="mt-4 text-sm/relaxed text-muted-foreground">
                Record a voice note, upload a video, type your history or attach lab PDFs before the
                call. Speech recognition transcribes your native language and clinical translation
                delivers it to your doctor — with your original audio always preserved for context.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  [FileAudio, "Voice notes transcribed in Hausa, Yoruba, Igbo, Spanish, French"],
                  [Video, "Video clips for movement, rashes and swelling assessment"],
                  [FileText, "Lab PDFs parsed and attached to your clinical record"],
                ].map(([Icon, label]) => {
                  const Ico = Icon as typeof FileAudio;
                  return (
                    <li key={String(label)} className="flex items-start gap-3">
                      <Ico className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span className="text-muted-foreground">{label as string}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Card className="shadow-card border-border/70">
              <CardHeader>
                <CardTitle className="text-base">Sample intake dossier</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Original transcript beside clinical English, exactly as the doctor sees it.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {INTAKE_DOSSIER.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <Badge variant="outline" className="text-xs">
                        {LANGUAGES[item.language]}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <p className="text-xs/relaxed text-muted-foreground italic">
                        {item.rawTranscript}
                      </p>
                      <p className="border-l-2 border-accent pl-3 text-xs/relaxed">
                        {item.translated}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="network" className="bg-card/60 border-t border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-bold">Lab &amp; pharmacy network</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Connected partners receive requisitions instantly in their portal inbox. Everyone else
              gets an official branded PDF requisition by email — no fax machines required.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PARTNER_DIRECTORY.map((partner) => (
                <Card key={partner.id} className="shadow-card border-border/70">
                  <CardContent className="flex items-start gap-3 pt-6">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                      {partner.type === "LAB" ? (
                        <FlaskConical className="size-5" />
                      ) : (
                        <Pill className="size-5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">{partner.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{partner.address}</p>
                      <Badge
                        variant={partner.hasPortalAccess ? "default" : "secondary"}
                        className={cn(
                          "mt-2 text-xs",
                          partner.hasPortalAccess && "bg-accent text-accent-foreground",
                        )}
                      >
                        {partner.hasPortalAccess ? "Portal connected" : "PDF by email"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2">
            <Building2 className="size-4" /> Wholesome Health · Lagos · Abuja · Port Harcourt
          </p>
          <p>Encrypted records · Licence-verified clinicians · &copy; 2026</p>
        </div>
      </footer>

      <BookingDialog doctor={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
