import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  ClipboardList,
  FlaskConical,
  Languages,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Pill,
  Plus,
  Send,
  Trash2,
  Video,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/wholesome/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  INTAKE_DOSSIER,
  LANGUAGES,
  LAB_TEST_CATALOG,
  PARTNER_DIRECTORY,
  type Medication,
} from "@/lib/wholesome-data";

export const Route = createFileRoute("/emr")({
  head: () => ({
    meta: [
      { title: "Clinician Desk — Wholesome Health EMR" },
      {
        name: "description",
        content:
          "Specialist workstation: incoming consultation calls, server-timed sessions, multilingual translation desk, SOAP charting, lab requisitions and e-prescriptions.",
      },
      { property: "og:title", content: "Clinician Desk — Wholesome Health EMR" },
      {
        property: "og:description",
        content:
          "Run timed telehealth consultations with side-by-side translation, SOAP notes, labs and prescriptions in one view.",
      },
    ],
  }),
  component: EmrDesk,
});

const SESSION_MINUTES = 30;
const TOTAL_SECONDS = SESSION_MINUTES * 60;

type Phase = "ringing" | "active" | "ended";

function formatClock(seconds: number) {
  const m = Math.floor(Math.max(seconds, 0) / 60);
  const s = Math.max(seconds, 0) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function EmrDesk() {
  const [phase, setPhase] = useState<Phase>("ringing");
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const warned = useRef<Record<number, boolean>>({});

  const [soap, setSoap] = useState({
    subjective:
      "3-day history of exertional central chest pain with nocturnal dyspnoea. Two missed antihypertensive doses.",
    objective: "BP 158/96 mmHg. HR 92 bpm regular. SpO2 97% room air. No peripheral oedema.",
    assessment: "Suspected stable angina on a background of poorly controlled hypertension.",
    plan: "",
  });
  const [finalized, setFinalized] = useState(false);

  const [selectedTests, setSelectedTests] = useState<string[]>([
    "Troponin I (high sensitivity)",
    "Lipid Profile",
  ]);
  const [labId, setLabId] = useState("lab-sapphire");

  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "med-1",
      drug: "Amlodipine",
      dosage: "10 mg",
      frequency: "Once daily",
      duration: "30 days",
      instructions: "Take at night. Report ankle swelling.",
    },
  ]);
  const [draft, setDraft] = useState<Omit<Medication, "id">>({
    drug: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });
  const [pharmacyId, setPharmacyId] = useState("pharm-wellcare");

  const endCall = useCallback((auto: boolean) => {
    setPhase("ended");
    if (auto) {
      toast.error("Session time elapsed", {
        description: "Peer connections closed. Finalize the clinical file to release the record.",
      });
    }
  }, []);

  useEffect(() => {
    if (phase !== "active") return;
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next === 600 && !warned.current[600]) {
          warned.current[600] = true;
          toast.warning("10 minutes remaining in consultation.");
        }
        if (next === 300 && !warned.current[300]) {
          warned.current[300] = true;
          toast.error("5 minutes remaining. Conclude clinical assessment.");
        }
        if (next <= 0) {
          window.clearInterval(id);
          endCall(true);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, endCall]);

  const urgency = remaining <= 300 ? "critical" : remaining <= 600 ? "warning" : "normal";
  const elapsedPct = ((TOTAL_SECONDS - remaining) / TOTAL_SECONDS) * 100;
  const selectedLab =
    PARTNER_DIRECTORY.find((p) => p.id === labId) ?? PARTNER_DIRECTORY[0]!;

  const sendRequisition = () => {
    if (selectedTests.length === 0) {
      toast.error("Select at least one diagnostic test.");
      return;
    }
    toast.success(
      selectedLab.hasPortalAccess
        ? `Requisition delivered to ${selectedLab.name} portal inbox`
        : `Branded PDF requisition queued to ${selectedLab.email}`,
      { description: `${selectedTests.length} test(s) ordered.` },
    );
  };

  const addMedication = () => {
    if (!draft.drug.trim() || !draft.dosage.trim()) {
      toast.error("Drug name and dosage are required.");
      return;
    }
    setMedications((prev) => [...prev, { ...draft, id: `med-${Date.now()}` }]);
    setDraft({ drug: "", dosage: "", frequency: "", duration: "", instructions: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Clinician desk · Dr. Folake Adeyemi · Cardiology
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold">Consultation workstation</h1>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <Bell className="size-3.5 text-accent" /> Server-authoritative session timer
          </Badge>
        </div>

        {phase === "ringing" && (
          <Card className="animate-pulse-ring mt-6 border-destructive/40 bg-destructive/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-destructive font-semibold text-destructive-foreground">
                    AK
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display text-lg font-bold">Incoming consultation call</p>
                  <p className="text-sm text-muted-foreground">
                    Aisha Kabir · 34F · 30-minute tier · intake dossier attached (Hausa, Yoruba,
                    French)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => endCall(false)}>
                  <PhoneOff className="size-4" /> Decline
                </Button>
                <Button
                  className="bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => setPhase("active")}
                >
                  <PhoneCall className="size-4" /> Accept &amp; connect
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-6">
            <Card className="shadow-card overflow-hidden border-border/70">
              <div className="bg-hero-gradient relative aspect-video">
                {phase === "active" && camOn ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-primary-foreground">
                    <Avatar className="size-20 border-2 border-primary-foreground/40">
                      <AvatarFallback className="bg-primary-foreground/15 text-2xl font-bold text-primary-foreground">
                        AK
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-display text-lg font-semibold">Aisha Kabir</p>
                    <Badge className="bg-success text-success-foreground">
                      HD stream · encrypted
                    </Badge>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-primary-foreground/70">
                    <p className="text-sm font-medium">
                      {phase === "ended" ? "Room closed" : "Camera off"}
                    </p>
                  </div>
                )}

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
                      urgency === "critical"
                        ? "bg-destructive text-destructive-foreground"
                        : urgency === "warning"
                          ? "bg-warning text-warning-foreground"
                          : "bg-background/85 text-foreground",
                    )}
                  >
                    <span className="size-2 animate-pulse rounded-full bg-current" />
                    {formatClock(remaining)}
                  </span>
                  {urgency !== "normal" && phase === "active" && (
                    <span className="rounded-full bg-background/85 px-3 py-1 text-xs font-semibold">
                      {urgency === "critical"
                        ? "Conclude clinical assessment"
                        : "10 minutes remaining"}
                    </span>
                  )}
                </div>

                {/* Picture-in-picture self view */}
                <div className="absolute right-4 bottom-4 flex h-24 w-36 items-center justify-center rounded-xl border border-primary-foreground/25 bg-background/90 text-xs font-semibold text-muted-foreground">
                  You (Dr. Adeyemi)
                </div>
              </div>

              <CardContent className="space-y-4 pt-5">
                <Progress value={elapsedPct} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <Button
                      variant={micOn ? "outline" : "destructive"}
                      size="icon"
                      onClick={() => setMicOn((v) => !v)}
                      aria-label="Toggle microphone"
                    >
                      {micOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                    </Button>
                    <Button
                      variant={camOn ? "outline" : "destructive"}
                      size="icon"
                      onClick={() => setCamOn((v) => !v)}
                      aria-label="Toggle camera"
                    >
                      {camOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                    </Button>
                  </div>
                  {phase === "ended" ? (
                    <Button asChild variant="outline">
                      <Link to="/">Back to portal</Link>
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={() => endCall(false)}>
                      <PhoneOff className="size-4" /> End consultation
                    </Button>
                  )}
                </div>
                {urgency === "critical" && phase === "active" && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 text-destructive" />
                    <p>
                      Hard stop at 00:00 — peer connections close automatically and the patient is
                      redirected to their consultation summary.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Languages className="size-4 text-accent" /> Translation desk
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Native transcript and clinical English, with original media preserved.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {INTAKE_DOSSIER.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {LANGUAGES[item.language]} → English
                        </Badge>
                        {item.kind === "audio" && (
                          <Badge variant="secondary" className="text-xs">
                            {item.durationSeconds}s audio
                          </Badge>
                        )}
                      </div>
                    </div>
                    {item.kind === "audio" && (
                      <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-card p-2.5">
                        <Button size="icon" variant="secondary" className="size-8 shrink-0">
                          <PhoneCall className="size-3.5" />
                        </Button>
                        <div className="h-1.5 flex-1 rounded-full bg-muted">
                          <div className="bg-accent-gradient h-full w-1/3 rounded-full" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          0:24 / 0:{item.durationSeconds}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                          Raw transcript
                        </p>
                        <p className="mt-1 text-sm/relaxed italic">{item.rawTranscript}</p>
                      </div>
                      <div className="border-l-2 border-accent pl-4">
                        <p className="text-xs font-semibold text-accent uppercase">
                          Clinical English
                        </p>
                        <p className="mt-1 text-sm/relaxed">{item.translated}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card h-fit border-border/70 lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle className="text-base">Clinical tools</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="soap">
                <TabsList className="w-full">
                  <TabsTrigger value="soap" className="flex-1 gap-1.5">
                    <ClipboardList className="size-4" /> SOAP
                  </TabsTrigger>
                  <TabsTrigger value="labs" className="flex-1 gap-1.5">
                    <FlaskConical className="size-4" /> Labs
                  </TabsTrigger>
                  <TabsTrigger value="rx" className="flex-1 gap-1.5">
                    <Pill className="size-4" /> Rx
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="soap" className="mt-5 space-y-4">
                  {(
                    [
                      ["subjective", "Subjective"],
                      ["objective", "Objective"],
                      ["assessment", "Assessment"],
                      ["plan", "Plan"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="space-y-1.5">
                      <Label htmlFor={key}>{label}</Label>
                      <Textarea
                        id={key}
                        rows={3}
                        disabled={finalized}
                        value={soap[key]}
                        placeholder={`Document ${label.toLowerCase()} findings…`}
                        onChange={(e) => setSoap((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                    <div>
                      <p className="text-sm font-semibold">Finalize note</p>
                      <p className="text-xs text-muted-foreground">
                        Locks the record and signs it with your licence.
                      </p>
                    </div>
                    <Switch
                      checked={finalized}
                      onCheckedChange={(value) => {
                        setFinalized(value);
                        if (value) toast.success("SOAP note finalized and signed.");
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="labs" className="mt-5 space-y-4">
                  <div>
                    <Label>Diagnostic tests</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {LAB_TEST_CATALOG.map((test) => {
                        const active = selectedTests.includes(test);
                        return (
                          <button
                            key={test}
                            type="button"
                            onClick={() =>
                              setSelectedTests((prev) =>
                                active ? prev.filter((t) => t !== test) : [...prev, test],
                              )
                            }
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                              active
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border text-muted-foreground hover:border-accent/60 hover:text-foreground",
                            )}
                          >
                            {test}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Destination laboratory</Label>
                    <div className="space-y-2">
                      {PARTNER_DIRECTORY.filter((p) => p.type === "LAB").map((lab) => (
                        <button
                          key={lab.id}
                          type="button"
                          onClick={() => setLabId(lab.id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                            labId === lab.id
                              ? "border-accent bg-accent/10"
                              : "border-border hover:border-accent/50",
                          )}
                        >
                          <span>
                            <span className="block text-sm font-semibold">{lab.name}</span>
                            <span className="block text-xs text-muted-foreground">{lab.email}</span>
                          </span>
                          <Badge variant={lab.hasPortalAccess ? "default" : "secondary"}>
                            {lab.hasPortalAccess ? "Portal" : "PDF email"}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full gap-2" onClick={sendRequisition}>
                    <Send className="size-4" /> Dispatch requisition
                  </Button>
                </TabsContent>

                <TabsContent value="rx" className="mt-5 space-y-4">
                  <div className="space-y-2">
                    {medications.map((med) => (
                      <div
                        key={med.id}
                        className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {med.drug} {med.dosage}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[med.frequency, med.duration].filter(Boolean).join(" · ")}
                          </p>
                          {med.instructions && (
                            <p className="mt-1 text-xs/relaxed">{med.instructions}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${med.drug}`}
                          onClick={() =>
                            setMedications((prev) => prev.filter((m) => m.id !== med.id))
                          }
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Drug name"
                      value={draft.drug}
                      onChange={(e) => setDraft({ ...draft, drug: e.target.value })}
                    />
                    <Input
                      placeholder="Dosage (e.g. 20 mg)"
                      value={draft.dosage}
                      onChange={(e) => setDraft({ ...draft, dosage: e.target.value })}
                    />
                    <Input
                      placeholder="Frequency"
                      value={draft.frequency}
                      onChange={(e) => setDraft({ ...draft, frequency: e.target.value })}
                    />
                    <Input
                      placeholder="Duration"
                      value={draft.duration}
                      onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                    />
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Special instructions"
                    value={draft.instructions}
                    onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
                  />
                  <Button variant="outline" className="w-full gap-2" onClick={addMedication}>
                    <Plus className="size-4" /> Add medication
                  </Button>

                  <Separator />

                  <div className="space-y-1.5">
                    <Label>Dispensing pharmacy</Label>
                    {PARTNER_DIRECTORY.filter((p) => p.type === "PHARMACY").map((pharmacy) => (
                      <button
                        key={pharmacy.id}
                        type="button"
                        onClick={() => setPharmacyId(pharmacy.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                          pharmacyId === pharmacy.id
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50",
                        )}
                      >
                        <span>
                          <span className="block text-sm font-semibold">{pharmacy.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {pharmacy.address}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={() =>
                      toast.success("E-prescription issued", {
                        description: `${medications.length} medication(s) routed for dispensing.`,
                      })
                    }
                  >
                    <Send className="size-4" /> Issue e-prescription
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
