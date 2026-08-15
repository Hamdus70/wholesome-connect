import { useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Check, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  DOCTORS,
  DURATION_TIERS,
  naira,
  priceFor,
  slotGrid,
  suggestAfter,
  type Doctor,
} from "@/lib/wholesome-data";

type Props = {
  doctor: Doctor | null;
  onOpenChange: (open: boolean) => void;
};

export function BookingDialog({ doctor, onOpenChange }: Props) {
  const [minutes, setMinutes] = useState<number>(30);
  const [slot, setSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const slots = useMemo(() => slotGrid(), []);

  if (!doctor) return null;

  const alternates = DOCTORS.filter(
    (d) => d.specialty === doctor.specialty && d.id !== doctor.id,
  );

  const handleSlot = (value: string) => {
    if (doctor.bookedSlots.includes(value)) {
      toast.error("Slot lock held by another patient", {
        description: `${value} is reserved. Nearest opening at ${suggestAfter(value)}.`,
      });
      return;
    }
    setSlot(value);
  };

  const handleConfirm = () => {
    if (!slot) {
      toast.error("Select an available time slot first.");
      return;
    }
    setConfirmed(true);
    toast.success("Slot lock acquired for 5 minutes", {
      description: `${doctor.name} · ${slot} · ${minutes} min. Complete payment to confirm.`,
    });
  };

  const close = (open: boolean) => {
    if (!open) {
      setSlot(null);
      setConfirmed(false);
      setMinutes(30);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={Boolean(doctor)} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-5 text-accent" />
            Book {doctor.name}
          </DialogTitle>
          <DialogDescription>
            {doctor.specialty} · {naira(doctor.hourlyRate)}/hour · collision-free slot locking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold">Consultation duration</p>
            <div className="flex flex-wrap gap-2">
              {DURATION_TIERS.map((tier) => (
                <button
                  key={tier.minutes}
                  type="button"
                  onClick={() => setMinutes(tier.minutes)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    minutes === tier.minutes
                      ? "border-accent bg-accent/10 text-accent-foreground"
                      : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground",
                  )}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Today&apos;s availability</p>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3" /> locked slots are held by other patients
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {slots.map((value) => {
                const locked = doctor.bookedSlots.includes(value);
                const selected = slot === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleSlot(value)}
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors",
                      locked && "border-destructive/30 bg-destructive/10 text-destructive",
                      !locked &&
                        !selected &&
                        "border-border text-muted-foreground hover:border-accent hover:text-foreground",
                      selected && "border-accent bg-accent text-accent-foreground",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>

          {alternates.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="size-4 text-warning" />
                Same-specialty fallbacks
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {alternates.map((alt) => (
                  <li key={alt.id}>
                    {alt.name} — {naira(alt.hourlyRate)}/hr ·{" "}
                    {alt.isOnline ? "online now" : "offline"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total payable</p>
              <p className="font-display text-2xl font-bold">{naira(priceFor(doctor, minutes))}</p>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <ShieldCheck className="size-3.5 text-accent" /> Paystack · Flutterwave · Stripe
            </Badge>
          </div>

          {confirmed && (
            <div className="animate-rise flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
              <Check className="mt-0.5 size-4 text-accent" />
              <p>
                Slot reserved at <strong>{slot}</strong> for {minutes} minutes. The booking commits
                to <strong>CONFIRMED</strong> once the payment webhook is verified.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Reserve &amp; pay</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
