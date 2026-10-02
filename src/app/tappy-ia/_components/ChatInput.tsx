"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiSendPlaneFill,
  RiMicFill,
  RiCloseLine,
  RiLoader4Line,
  RiImageLine,
} from "react-icons/ri";

export interface Attachment {
  id: string;
  file: File;
  dataUrl: string;
  mimeType: string;
  name: string;
}

interface Props {
  onSendText: (text: string, attachments: Attachment[]) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  recording: boolean;
  processing: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  /** Texto preenchido externamente (ex: quick prompt) */
  presetText?: string;
  /** Anexo injetado externamente (ex: foto de imóvel selecionada na galeria) */
  pendingAttachment?: Attachment | null;
  /** Callback chamado após o anexo externo ser consumido */
  onPendingAttachmentConsumed?: () => void;
}

const MAX_ATTACHMENTS = 4;
const MAX_SIZE_MB = 10;

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

export function ChatInput({
  onSendText,
  onStartRecording,
  onStopRecording,
  recording,
  processing,
  placeholder = "Pergunte qualquer coisa…",
  autoFocus = false,
  presetText,
  pendingAttachment,
  onPendingAttachmentConsumed,
}: Props) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Presetagem vinda de fora (quick prompts)
  useEffect(() => {
    if (presetText !== undefined) {
      setText(presetText);
      // foco ao final
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        const el = textareaRef.current;
        if (el) el.setSelectionRange(el.value.length, el.value.length);
      });
    }
  }, [presetText]);

  // Injeta anexo externo (ex: foto de imóvel da galeria)
  useEffect(() => {
    if (!pendingAttachment) return;
    setAttachments((prev) => {
      if (prev.some((a) => a.id === pendingAttachment.id)) return prev;
      return [...prev, pendingAttachment].slice(0, MAX_ATTACHMENTS);
    });
    onPendingAttachmentConsumed?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAttachment]);

  // Auto-grow do textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [text]);

  // Timer de gravação
  useEffect(() => {
    if (!recording) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 200);
    return () => clearInterval(id);
  }, [recording]);

  const handleAddFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    const valid: Attachment[] = [];
    for (const f of list) {
      if (!f.type.startsWith("image/")) continue; // por enquanto só imagens
      if (f.size > MAX_SIZE_MB * 1024 * 1024) continue;
      try {
        const dataUrl = await readAsDataURL(f);
        valid.push({
          id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 6)}`,
          file: f,
          dataUrl,
          mimeType: f.type,
          name: f.name,
        });
      } catch {
        /* ignore */
      }
    }
    setAttachments((prev) => [...prev, ...valid].slice(0, MAX_ATTACHMENTS));
  }, []);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
    // reset pra permitir o mesmo arquivo
    if (fileRef.current) fileRef.current.value = "";
  };

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const it of Array.from(items)) {
        if (it.kind === "file") {
          const f = it.getAsFile();
          if (f && f.type.startsWith("image/")) files.push(f);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        handleAddFiles(files);
      }
    },
    [handleAddFiles]
  );

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const send = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    if (processing || recording) return;
    onSendText(trimmed, attachments);
    setText("");
    setAttachments([]);
  }, [text, attachments, processing, recording, onSendText]);

  const hasContent = text.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onPickFiles}
        className="hidden"
      />

      <div
        className={`relative rounded-3xl bg-white/[0.05] backdrop-blur-xl border transition-all ${
          recording
            ? "border-red-500/40 shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
            : processing
              ? "border-blue-400/30"
              : "border-white/10 focus-within:border-orange-500/40 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_0_4px_rgba(37, 211, 102,0.05)]"
        }`}
      >
        {/* Preview de anexos */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 p-3 pb-1">
                {attachments.map((a) => (
                  <div
                    key={a.id}
                    className="group relative w-16 h-16 rounded-xl overflow-hidden border border-white/15 bg-black/20"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.dataUrl}
                      alt={a.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeAttachment(a.id)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                      aria-label="Remover"
                    >
                      <RiCloseLine className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/60 text-[9px] text-white/80 truncate">
                      <RiImageLine className="w-2.5 h-2.5 inline mr-0.5" />
                      {a.name}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Linha principal */}
        {recording ? (
          <div className="flex items-center gap-3 p-3">
            <button
              type="button"
              onClick={onStopRecording}
              className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 flex items-center justify-center hover:bg-red-500/30 transition-colors flex-shrink-0"
              aria-label="Cancelar gravação"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-center gap-3">
              <div className="relative flex items-center gap-1 h-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1 rounded-full bg-red-400"
                    animate={{ height: ["30%", "100%", "30%"] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-sm text-red-300 tabular-nums">
                {fmtTime(elapsed)}
              </span>
              <span className="text-xs text-white/50">gravando…</span>
            </div>
            <button
              type="button"
              onClick={onStopRecording}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
              aria-label="Parar e enviar"
            >
              <RiSendPlaneFill className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-1 p-2">
            {/* Attach */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={processing || attachments.length >= MAX_ATTACHMENTS}
              className="w-10 h-10 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-white/60 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Anexar imagem"
              title="Anexar imagem"
            >
              <RiAddLine className="w-5 h-5" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={onPaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              autoFocus={autoFocus}
              disabled={processing}
              placeholder={processing ? "Processando…" : placeholder}
              className="flex-1 resize-none bg-transparent text-white placeholder:text-white/30 text-sm leading-6 py-2 px-1 outline-none max-h-[180px] overflow-y-auto disabled:opacity-60"
              style={{ scrollbarWidth: "thin" }}
            />

            {/* Mic ou Send */}
            {processing ? (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-300 flex-shrink-0">
                <RiLoader4Line className="w-5 h-5 animate-spin" />
              </div>
            ) : hasContent ? (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                type="button"
                onClick={send}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-[#25D366] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                aria-label="Enviar"
              >
                <RiSendPlaneFill className="w-4 h-4" />
              </motion.button>
            ) : (
              <button
                type="button"
                onClick={onStartRecording}
                className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-gradient-to-br hover:from-orange-500 hover:to-[#25D366] text-white/70 hover:text-white flex items-center justify-center transition-all flex-shrink-0"
                aria-label="Gravar áudio"
                title="Gravar áudio"
              >
                <RiMicFill className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hint */}
      {!recording && !processing && (
        <div className="mt-2 text-center text-[10px] text-white/25">
          Pressione <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px]">Enter</kbd> para enviar · <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px]">Shift+Enter</kbd> quebra linha · cole imagens direto
        </div>
      )}
    </div>
  );
}
