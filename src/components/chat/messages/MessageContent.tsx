"use client";

import AudioMessage from "./AudioMessage";
import ImageMessage from "./ImageMessage";
import VideoMessage from "./VideoMessage";
import DocumentMessage from "./DocumentMessage";
import { RiMapPinLine, RiUserLine } from "react-icons/ri";

interface MessageContentProps {
  message: {
    type?: string;
    body?: string;
    content?: string;
    mediaUrl?: string;
    mimetype?: string;
    filename?: string;
    caption?: string;
    hasMedia?: boolean;
    location?: {
      latitude: number;
      longitude: number;
      description?: string;
    };
    vcard?: string;
  };
  isFromMe?: boolean;
}

export default function MessageContent({ message, isFromMe = false }: MessageContentProps) {
  const type = message.type?.toLowerCase() || "text";
  const content = message.body || message.content || "";
  const mediaUrl = message.mediaUrl;
  const mimetype = message.mimetype || "";

  // Determinar tipo baseado no mimetype se não tiver type
  const getMediaType = () => {
    if (type && type !== "text") return type;
    if (!mimetype) return "text";
    
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype.startsWith("video/")) return "video";
    if (mimetype.startsWith("audio/") || mimetype.includes("ogg")) return "audio";
    if (mimetype.includes("pdf") || mimetype.includes("document") || mimetype.includes("spreadsheet")) return "document";
    
    return "text";
  };

  const mediaType = getMediaType();

  // Renderizar baseado no tipo
  switch (mediaType) {
    case "image":
      if (mediaUrl) {
        return (
          <ImageMessage 
            mediaUrl={mediaUrl} 
            caption={message.caption || content}
            isFromMe={isFromMe}
          />
        );
      }
      break;

    case "video":
      if (mediaUrl) {
        return (
          <VideoMessage 
            mediaUrl={mediaUrl} 
            caption={message.caption || content}
            isFromMe={isFromMe}
          />
        );
      }
      break;

    case "audio":
    case "ptt": // Push to talk (áudio do WhatsApp)
      if (mediaUrl) {
        return (
          <AudioMessage 
            mediaUrl={mediaUrl}
            isFromMe={isFromMe}
          />
        );
      }
      break;

    case "document":
    case "file":
      if (mediaUrl) {
        return (
          <DocumentMessage 
            mediaUrl={mediaUrl}
            filename={message.filename}
            mimetype={mimetype}
            caption={message.caption || content}
            isFromMe={isFromMe}
          />
        );
      }
      break;

    case "location":
      if (message.location) {
        const { latitude, longitude, description } = message.location;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        return (
          <a 
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              isFromMe 
                ? "bg-white/10 hover:bg-white/20" 
                : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isFromMe ? "bg-white/10" : "bg-red-100 dark:bg-red-500/20"
            }`}>
              <RiMapPinLine className={`w-5 h-5 ${isFromMe ? "text-white" : "text-red-500"}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isFromMe ? "text-white" : "text-neutral-900 dark:text-white"}`}>
                Localização
              </p>
              {description && (
                <p className={`text-xs ${isFromMe ? "text-white/60" : "text-neutral-500"}`}>
                  {description}
                </p>
              )}
              <p className={`text-xs ${isFromMe ? "text-white/60" : "text-neutral-500"}`}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          </a>
        );
      }
      break;

    case "contact":
    case "vcard":
      if (message.vcard) {
        // Parse vcard básico
        const nameMatch = message.vcard.match(/FN:(.+)/);
        const phoneMatch = message.vcard.match(/TEL[^:]*:(.+)/);
        const name = nameMatch?.[1] || "Contato";
        const phone = phoneMatch?.[1] || "";
        
        return (
          <div className={`flex items-center gap-3 p-3 rounded-xl ${
            isFromMe 
              ? "bg-white/10" 
              : "bg-neutral-100 dark:bg-neutral-700"
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isFromMe ? "bg-white/10" : "bg-blue-100 dark:bg-blue-500/20"
            }`}>
              <RiUserLine className={`w-5 h-5 ${isFromMe ? "text-white" : "text-blue-500"}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isFromMe ? "text-white" : "text-neutral-900 dark:text-white"}`}>
                {name}
              </p>
              {phone && (
                <p className={`text-xs ${isFromMe ? "text-white/60" : "text-neutral-500"}`}>
                  {phone}
                </p>
              )}
            </div>
          </div>
        );
      }
      break;

    case "sticker":
      if (mediaUrl) {
        return (
          <img 
            src={mediaUrl} 
            alt="Sticker" 
            className="w-32 h-32 object-contain"
          />
        );
      }
      break;
  }

  // Fallback: texto simples
  if (content) {
    return (
      <p className={`text-sm whitespace-pre-wrap break-words ${
        isFromMe ? "text-white" : "text-neutral-900 dark:text-white"
      }`}>
        {content}
      </p>
    );
  }

  // Se tem mídia mas não conseguiu renderizar
  if (message.hasMedia && mediaUrl) {
    return (
      <a 
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-sm underline ${isFromMe ? "text-white/80" : "text-blue-500"}`}
      >
        📎 Abrir mídia
      </a>
    );
  }

  return null;
}
