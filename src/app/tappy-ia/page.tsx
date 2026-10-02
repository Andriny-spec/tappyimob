"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSparklingLine,
  RiBrainLine,
  RiLoader4Line,
  RiImageLine,
  RiHome4Line,
  RiDownloadLine,
  RiCamera3Line,
  RiInstagramLine,
  RiArticleLine,
  RiBuildingLine,
} from "react-icons/ri";
import { useAuth } from "@/providers/auth-provider";
import { ParticleHead } from "./_components/ParticleHead";
import { PropertiesModal } from "./_components/PropertiesModal";
import { ImageModal } from "./_components/ImageModal";
import { ConversationSidebar } from "./_components/ConversationSidebar";
import { UserTopbar } from "./_components/UserTopbar";
import { ChatInput, type Attachment } from "./_components/ChatInput";
import { PropertyPhotoGallery } from "./_components/PropertyPhotoGallery";
import { TextoRico } from "./_components/TextoRico";

type AppState = "idle" | "recording" | "processing";

const ALLOWED_ROLES = new Set(["ADMIN", "CORRETOR", "FOTOGRAFO"]);

interface GeneratedImage {
  dataUrl?: string;
  url?: string;
  prompt: string;
  size: string;
  model?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Property = any;

interface PropertyPhotos {
  title: string;
  code: string;
  images: string[];
}

interface HistoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl: string | null;
  imagePrompt: string | null;
  imageSize: string | null;
  properties: Property[] | null;
  propertyPhotos: PropertyPhotos | null;
  createdAt: string;
}

export default function TappyIAPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [appState, setAppState] = useState<AppState>("idle");
  const [showProps, setShowProps] = useState<Property[] | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [presetText, setPresetText] = useState<string | undefined>(undefined);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Guard de auth
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!ALLOWED_ROLES.has(user.role)) router.replace("/");
  }, [user, isLoading, router]);

  // Abre sidebar por padrão em desktop
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  // Auto-scroll da timeline
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length, appState]);

  // ================================================================
  // Envio
  // ================================================================

  const handleApiResult = useCallback(
    (data: {
      conversationId?: string;
      transcript: string;
      response: string;
      audio: string;
      properties?: Property[] | null;
      propertyPhotos?: PropertyPhotos | null;
      generatedImage?: GeneratedImage | null;
      userImageUrl?: string | null;
    }) => {
      if (data.conversationId) setConversationId(data.conversationId);

      // Atualiza bolha otimista do user com imageUrl do backend (se houver)
      if (data.userImageUrl) {
        setHistory((prev) => {
          const next = [...prev];
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].role === "user" && !next[i].imageUrl) {
              next[i] = { ...next[i], imageUrl: data.userImageUrl! };
              break;
            }
          }
          return next;
        });
      }

      // Adiciona resposta do assistant
      setHistory((prev) => [
        ...prev,
        {
          id: `tmp-a-${Date.now()}`,
          role: "assistant",
          content: data.response,
          imageUrl: data.generatedImage?.url ?? null,
          imagePrompt: data.generatedImage?.prompt ?? null,
          imageSize: data.generatedImage?.size ?? null,
          properties: data.properties ?? null,
          propertyPhotos: data.propertyPhotos ?? null,
          createdAt: new Date().toISOString(),
        },
      ]);

      // Toca áudio TTS em background (não bloqueia UI)
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        const audio = new Audio(data.audio);
        audioRef.current = audio;
        audio.play().catch(() => {});
      } catch {
        /* ignore */
      }

      setSidebarRefreshKey((k) => k + 1);
      setAppState("idle");

      // Abre modais automáticos
      if (data.properties?.length) setShowProps(data.properties);
      if (data.generatedImage) {
        setLightboxImage(data.generatedImage);
      }
    },
    []
  );

  const sendText = useCallback(
    async (text: string, attachments: Attachment[]) => {
      const trimmed = text.trim();
      if (!trimmed && attachments.length === 0) return;

      // Empurra bolha otimista do user (com preview local do anexo)
      setHistory((prev) => [
        ...prev,
        {
          id: `tmp-u-${Date.now()}`,
          role: "user",
          content: trimmed || "(imagem anexada)",
          imageUrl: attachments[0]?.dataUrl ?? null,
          imagePrompt: null,
          imageSize: null,
          properties: null,
          propertyPhotos: null,
          createdAt: new Date().toISOString(),
        },
      ]);
      setPresetText(undefined);
      setAppState("processing");

      try {
        const res = await fetch("/api/tappy-ia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: trimmed,
            conversationId,
            attachments: attachments.map((a) => ({
              dataUrl: a.dataUrl,
              mimeType: a.mimeType,
              name: a.name,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        handleApiResult(data);
      } catch {
        setAppState("idle");
      }
    },
    [conversationId, handleApiResult]
  );

  const sendAudio = useCallback(
    async (blob: Blob) => {
      setAppState("processing");

      // Otimista: "…" temporário (transcrição ainda não conhecida)
      const tmpId = `tmp-u-${Date.now()}`;
      setHistory((prev) => [
        ...prev,
        {
          id: tmpId,
          role: "user",
          content: "🎙️ …",
          imageUrl: null,
          imagePrompt: null,
          imageSize: null,
          properties: null,
          propertyPhotos: null,
          createdAt: new Date().toISOString(),
        },
      ]);

      try {
        const fd = new FormData();
        fd.append("audio", blob, "audio.webm");
        if (conversationId) fd.append("conversationId", conversationId);
        const res = await fetch("/api/tappy-ia", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Substitui transcrição da bolha otimista pela real
        setHistory((prev) =>
          prev.map((m) => (m.id === tmpId ? { ...m, content: data.transcript } : m))
        );
        handleApiResult(data);
      } catch {
        setHistory((prev) => prev.filter((m) => m.id !== tmpId));
        setAppState("idle");
      }
    },
    [conversationId, handleApiResult]
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 500) sendAudio(blob);
        else setAppState("idle");
      };
      mrRef.current = mr;
      mr.start();
      setAppState("recording");
    } catch {
      setAppState("idle");
    }
  }, [sendAudio]);

  const stopRecording = useCallback(() => {
    mrRef.current?.stop();
  }, []);

  // ================================================================
  // Conversas
  // ================================================================

  const loadConversation = useCallback(async (id: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/tappy-ia/conversations/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const msgs: HistoryMessage[] = (data.conversation?.messages || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          imageUrl: m.imageUrl ?? null,
          imagePrompt: m.imagePrompt ?? null,
          imageSize: m.imageSize ?? null,
          properties: m.properties ?? null,
          propertyPhotos: m.propertyPhotos ?? null,
          createdAt: m.createdAt,
        })
      );
      setHistory(msgs);
      setConversationId(id);
    } catch {
      setHistory([]);
      setConversationId(null);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleSelectConversation = useCallback(
    (id: string | null) => {
      audioRef.current?.pause();
      mrRef.current?.stop();
      if (id === null) {
        setConversationId(null);
        setHistory([]);
        setAppState("idle");
        return;
      }
      if (id === conversationId) return;
      loadConversation(id);
    },
    [conversationId, loadConversation]
  );

  // Foto da galeria selecionada → vira anexo no ChatInput
  const handleSelectPhoto = useCallback(async (url: string, label: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
      });
      const mimeType = blob.type || "image/jpeg";
      const file = new File([blob], label, { type: mimeType });
      const attachment: Attachment = {
        id: `gallery-${Date.now()}`,
        file,
        dataUrl,
        mimeType,
        name: label,
      };
      setPendingAttachment(attachment);
    } catch {
      /* ignore */
    }
  }, []);

  // ================================================================
  // Render
  // ================================================================

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#070f1c]">
        <RiLoader4Line className="w-8 h-8 text-orange-400 animate-spin" />
      </main>
    );
  }
  if (!user || !ALLOWED_ROLES.has(user.role)) return null;

  const isEmpty = history.length === 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070f1c]">
      {/* Fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#070f1c] via-[#0B2545] to-[#071B38]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:52px_52px]" />
      <motion.div
        className="absolute top-16 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37, 211, 102,0.12) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-24 right-1/3 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <UserTopbar onOpenSidebar={() => setSidebarOpen(true)} />

      <ConversationSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentId={conversationId}
        onSelect={handleSelectConversation}
        refreshKey={sidebarRefreshKey}
      />

      <section
        className={`relative min-h-screen pt-14 transition-[padding] duration-300 ${
          sidebarOpen ? "lg:pl-72" : ""
        }`}
      >
        {historyLoading ? (
          <div className="flex items-center justify-center py-20 text-white/40 gap-2 text-sm">
            <RiLoader4Line className="w-4 h-4 animate-spin" />
            Carregando conversa…
          </div>
        ) : isEmpty ? (
          // ============================
          // HERO vazio — input central
          // ============================
          <div className="relative flex flex-col items-center justify-center gap-6 px-4 min-h-[calc(100vh-3.5rem)]">
            {/* Globo só em processing */}
            <AnimatePresence>
              {appState === "processing" && (
                <motion.div
                  key="sphere-processing"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  <motion.span
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ border: "1.5px solid rgba(147,197,253,0.3)" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <ParticleHead />
                </motion.div>
              )}
            </AnimatePresence>

            {appState !== "processing" && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/[0.08]">
                <RiBrainLine className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-orange-300/80">
                  Assistente Pessoal
                </span>
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-none text-white text-center">
              Tappy{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #25D366 60%, #4ADE80 100%)" }}
              >
                IA
              </span>
            </h1>
            <p className="text-[#93c5fd]/50 text-sm sm:text-base max-w-[320px] leading-relaxed text-center">
              Seu assistente inteligente, sempre pronto para ajudar
            </p>

            {/* Input central */}
            <div className="w-full max-w-2xl mt-2">
              <ChatInput
                onSendText={sendText}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                recording={appState === "recording"}
                processing={appState === "processing"}
                autoFocus
                presetText={presetText}
                pendingAttachment={pendingAttachment}
                onPendingAttachmentConsumed={() => setPendingAttachment(null)}
              />
            </div>

            <QuickPrompts onPick={(p) => setPresetText(p)} />
          </div>
        ) : (
          // ============================
          // CHAT — timeline + input fixo
          // ============================
          <div className="relative flex flex-col h-[calc(100vh-3.5rem)]">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 pb-6 timeline-scroll"
            >
              <div className="max-w-3xl mx-auto space-y-5 pb-6">
                {history.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    onImageClick={(img) => setLightboxImage(img)}
                    onPropsClick={(props) => setShowProps(props)}
                    onSelectPhoto={handleSelectPhoto}
                  />
                ))}

                {/* Indicador de processing — globo inline compacto */}
                <AnimatePresence>
                  {appState === "processing" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10">
                        <div className="scale-[0.35] origin-left -my-8 -mx-4">
                          <ParticleHead />
                        </div>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-orange-400/70"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Input fixo no bottom */}
            <div className="px-4 sm:px-6 pb-4 pt-2 bg-gradient-to-t from-[#070f1c] via-[#070f1c]/90 to-transparent">
              <div className="max-w-3xl mx-auto">
                <ChatInput
                  onSendText={sendText}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  recording={appState === "recording"}
                  processing={appState === "processing"}
                  placeholder="Continue a conversa…"
                  presetText={presetText}
                  pendingAttachment={pendingAttachment}
                  onPendingAttachmentConsumed={() => setPendingAttachment(null)}
                />
              </div>
            </div>

            <style jsx>{`
              .timeline-scroll::-webkit-scrollbar {
                width: 8px;
              }
              .timeline-scroll::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.08);
                border-radius: 4px;
              }
            `}</style>
          </div>
        )}
      </section>

      {showProps && (
        <PropertiesModal properties={showProps} onClose={() => setShowProps(null)} />
      )}
      {lightboxImage && (
        <ImageModal
          image={{
            dataUrl: lightboxImage.url || lightboxImage.dataUrl || "",
            prompt: lightboxImage.prompt,
            size: lightboxImage.size,
          }}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </main>
  );
}

// ===================================================================
// MessageBubble
// ===================================================================
function MessageBubble({
  message,
  onImageClick,
  onPropsClick,
  onSelectPhoto,
}: {
  message: HistoryMessage;
  onImageClick: (img: GeneratedImage) => void;
  onPropsClick: (props: Property[]) => void;
  onSelectPhoto: (url: string, label: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest">
          {isUser ? (
            <span className="text-white/40">Você</span>
          ) : (
            <>
              <RiSparklingLine className="w-3 h-3 text-orange-400" />
              <span className="text-orange-300/70">Tappy IA</span>
            </>
          )}
        </div>

        {message.content && message.content !== "(imagem anexada)" && (
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              isUser
                ? "bg-gradient-to-br from-orange-500/20 to-[#25D366]/10 text-white/95 border border-orange-500/20"
                : "bg-white/[0.04] text-white/90 border border-white/10"
            }`}
          >
            {isUser ? message.content : <TextoRico texto={message.content} />}
          </div>
        )}

        {message.imageUrl && (
          <button
            onClick={() =>
              onImageClick({
                url: message.imageUrl!,
                prompt: message.imagePrompt || "",
                size: message.imageSize || "1024x1024",
              })
            }
            className="group relative rounded-2xl overflow-hidden border border-white/15 bg-black/20 max-w-xs hover:border-orange-500/50 transition-all"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.imageUrl}
              alt={message.imagePrompt || "Imagem"}
              className="w-full h-auto block max-h-[320px] object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs">
                <RiImageLine className="w-3.5 h-3.5" />
                Abrir
              </div>
            </div>
            {!isUser && (
              <a
                href={message.imageUrl}
                download
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80"
                aria-label="Baixar"
              >
                <RiDownloadLine className="w-3.5 h-3.5" />
              </a>
            )}
          </button>
        )}

        {message.properties && Array.isArray(message.properties) && message.properties.length > 0 && (
          <button
            onClick={() => onPropsClick(message.properties!)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs hover:bg-blue-500/20 transition-colors"
          >
            <RiHome4Line className="w-3.5 h-3.5" />
            Ver {message.properties.length} imóve
            {message.properties.length === 1 ? "l" : "is"}
          </button>
        )}

        {message.propertyPhotos && (
          <PropertyPhotoGallery
            propertyTitle={message.propertyPhotos.title}
            propertyCode={message.propertyPhotos.code}
            images={message.propertyPhotos.images}
            onSelectPhoto={onSelectPhoto}
          />
        )}
      </div>
    </motion.div>
  );
}

// ===================================================================
// QuickPrompts
// ===================================================================
const QUICK_PROMPTS: { icon: React.ReactNode; label: string; prompt: string; tint: string }[] = [
  {
    icon: <RiBuildingLine className="w-4 h-4" />,
    label: "Buscar imóvel",
    prompt: "Me mostre os imóveis disponíveis para venda em São Paulo até 1 milhão",
    tint: "from-blue-500/15 to-blue-500/5 border-blue-500/30 text-blue-200",
  },
  {
    icon: <RiCamera3Line className="w-4 h-4" />,
    label: "Sugestão de fotos",
    prompt: "Sugira um roteiro de fotos para um apartamento de 2 dormitórios",
    tint: "from-purple-500/15 to-purple-500/5 border-purple-500/30 text-purple-200",
  },
  {
    icon: <RiInstagramLine className="w-4 h-4" />,
    label: "Post Instagram",
    prompt: "Crie um post para Instagram divulgando um imóvel premium com piscina",
    tint: "from-pink-500/15 to-pink-500/5 border-pink-500/30 text-pink-200",
  },
  {
    icon: <RiArticleLine className="w-4 h-4" />,
    label: "Descrição de anúncio",
    prompt: "Me ajude a redigir uma descrição persuasiva para anúncio de imóvel",
    tint: "from-orange-500/15 to-orange-500/5 border-orange-500/30 text-orange-200",
  },
];

function QuickPrompts({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="w-full max-w-2xl mt-1"
    >
      <div className="flex items-center gap-2 mb-2 justify-center">
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
          Ou comece com uma sugestão
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_PROMPTS.map((q, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            onClick={() => onPick(q.prompt)}
            className={`group flex flex-col items-start gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-br ${q.tint} border backdrop-blur-sm hover:scale-[1.03] active:scale-[0.97] transition-all text-left`}
          >
            <span className="opacity-90 group-hover:opacity-100">{q.icon}</span>
            <span className="text-[11px] font-semibold leading-tight">{q.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
