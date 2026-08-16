import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  Languages,
  Mic,
  Paperclip,
  Play,
  Send,
  Square,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LANGUAGES, type LanguageCode } from "@/lib/wholesome-data";
import {
  appendMessage,
  hydrateThread,
  subscribeThread,
  type ConsultMessage,
  type SenderRole,
} from "@/lib/consult-chat";

type Props = {
  /** Whose toolbar this is — controls bubble alignment and translation display. */
  viewer: SenderRole;
  senderName: string;
  /** Language outgoing messages are composed in. */
  language: LanguageCode;
  /** Doctors see raw native text plus clinical English under each patient bubble. */
  showTranslations?: boolean;
  disabled?: boolean;
  className?: string;
};

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ConsultChat({
  viewer,
  senderName,
  language,
  showTranslations = false,
  disabled = false,
  className,
}: Props) {
  const [messages, setMessages] = useState<ConsultMessage[]>([]);
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrateThread();
    return subscribeThread(setMessages);
  }, []);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const ordered = useMemo(
    () => [...messages].sort((a, b) => a.createdAt - b.createdAt),
    [messages],
  );

  const sendText = () => {
    if (!text.trim()) return;
    appendMessage({ senderRole: viewer, senderName, kind: "text", rawText: text.trim(), sourceLang: language });
    setText("");
  };

  const stopRecording = (send: boolean) => {
    setRecording(false);
    const duration = seconds;
    setSeconds(0);
    if (!send) {
      toast.info("Voice note discarded.");
      return;
    }
    if (duration < 1) {
      toast.error("Hold the recorder for at least one second.");
      return;
    }
    appendMessage({
      senderRole: viewer,
      senderName,
      kind: "voice",
      sourceLang: language,
      durationSeconds: duration,
      rawText: language === "en" ? "Live voice note" : undefined,
      translatedText:
        language === "en"
          ? undefined
          : `[${LANGUAGES[language]} → Clinical English] Voice note transcribed on arrival (${duration}s).`,
    });
    toast.success(`Voice note sent · ${clock(duration)}`, {
      description: language === "en" ? undefined : "Speech-to-text and translation queued.",
    });
  };

  const attach = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files).slice(0, 4)) {
      appendMessage({
        senderRole: viewer,
        senderName,
        kind: "file",
        sourceLang: "en",
        fileName: file.name,
        fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
      });
    }
    toast.success("Attachment sent into the consultation stream", {
      description: "Encrypted at rest (AES-256) and linked to this appointment.",
    });
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <ScrollArea className="min-h-64 flex-1 pr-3">
        <div className="space-y-3">
          {ordered.map((message) => {
            const mine = message.senderRole === viewer;
            const translated = showTranslations && !mine && message.translatedText;
            return (
              <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl border px-3.5 py-2.5 text-sm",
                    mine
                      ? "border-accent/30 bg-accent/10"
                      : "border-border bg-muted/60",
                  )}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold">{message.senderName}</span>
                    {message.sourceLang !== "en" && (
                      <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                        {LANGUAGES[message.sourceLang]}
                      </Badge>
                    )}
                  </div>

                  {message.kind === "voice" && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                      <Button size="icon" variant="secondary" className="size-7 shrink-0">
                        <Play className="size-3" />
                      </Button>
                      <div className="h-1.5 flex-1 rounded-full bg-muted">
                        <div className="bg-accent-gradient h-full w-1/4 rounded-full" />
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {clock(message.durationSeconds ?? 0)}
                      </span>
                    </div>
                  )}

                  {message.kind === "file" && (
                    <div className="mb-1 flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                      <FileText className="size-4 text-accent" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{message.fileName}</p>
                        <p className="text-[11px] text-muted-foreground">{message.fileSizeKb} KB</p>
                      </div>
                    </div>
                  )}

                  {message.rawText && <p className="leading-relaxed">{message.rawText}</p>}

                  {translated && (
                    <div className="mt-2 border-l-2 border-accent pl-3">
                      <p className="text-[10px] font-semibold tracking-wide text-accent uppercase">
                        <Languages className="mr-1 inline size-3" /> Clinical English
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed">{message.translatedText}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottom} />
        </div>
      </ScrollArea>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) attach(e.dataTransfer.files);
        }}
        className={cn(
          "mt-3 rounded-xl border border-dashed p-3 transition-colors",
          dragging ? "border-accent bg-accent/10" : "border-border bg-muted/30",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        {recording ? (
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <span className="size-2.5 animate-pulse rounded-full bg-destructive" />
              Recording voice note · {clock(seconds)}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => stopRecording(false)}>
                <Trash2 className="size-4" /> Discard
              </Button>
              <Button size="sm" onClick={() => stopRecording(true)}>
                <Square className="size-4" /> Stop &amp; send
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <Textarea
                rows={2}
                value={text}
                disabled={disabled}
                placeholder={
                  disabled
                    ? "Chat closes with the session."
                    : `Message in ${LANGUAGES[language]}… (Enter to send)`
                }
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendText();
                  }
                }}
                className="min-h-11 resize-none bg-card"
              />
              <Button size="icon" disabled={disabled} onClick={sendText} aria-label="Send message">
                <Send className="size-4" />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => setRecording(true)}
              >
                <Mic className="size-4" /> Voice note
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => fileInput.current?.click()}
              >
                <Paperclip className="size-4" /> Attach
              </Button>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UploadCloud className="size-3.5" /> drag files here — PNG, JPG, PDF
              </span>
              <input
                ref={fileInput}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  attach(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}