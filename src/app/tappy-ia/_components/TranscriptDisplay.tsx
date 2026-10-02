"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RiUserVoiceLine, RiSparklingLine } from "react-icons/ri";

interface Props {
  transcript: string;
  response: string;
  audioSrc: string;
  onContinue: () => void;
}

function AnimatedWords({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function TranscriptDisplay({ transcript, response, audioSrc, onContinue }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptWords = transcript.trim().split(/\s+/).filter(Boolean).length;
  const responseDelay   = transcriptWords * 0.06 + 0.4;

  useEffect(() => {
    if (!audioSrc) return;
    const audio = new Audio(audioSrc);
    audioRef.current = audio;

    const playTimer = setTimeout(() => {
      audio.play().catch(() => null);
    }, (responseDelay + 0.2) * 1000);

    // Quando o áudio terminar, volta a escutar
    audio.onended = () => {
      setTimeout(onContinue, 600);
    };

    return () => {
      clearTimeout(playTimer);
      audio.pause();
      audio.onended = null;
    };
  }, [audioSrc, responseDelay, onContinue]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="flex flex-col items-center gap-7 px-6 max-w-xl text-center"
    >
      {/* O que o usuário disse */}
      <div className="flex flex-col items-center gap-1.5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-1.5 text-white/25 text-[11px] uppercase tracking-widest"
        >
          <RiUserVoiceLine className="w-3 h-3" />
          Você disse
        </motion.div>
        <p className="text-base sm:text-lg text-white/50 leading-relaxed font-light">
          <AnimatedWords text={transcript} delay={0} />
        </p>
      </div>

      {/* Divisor */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: transcriptWords * 0.06 + 0.2, duration: 0.5 }}
        className="w-10 h-px bg-orange-500/30"
      />

      {/* Resposta */}
      <div className="flex flex-col items-center gap-1.5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: responseDelay - 0.1, duration: 0.4 }}
          className="flex items-center gap-1.5 text-orange-400/60 text-[11px] uppercase tracking-widest"
        >
          <RiSparklingLine className="w-3 h-3" />
          Tappy IA
        </motion.div>
        <p className="text-2xl sm:text-3xl font-semibold text-white leading-snug">
          <AnimatedWords
            // Tela de voz anima palavra a palavra: tira a marcação do texto
            text={response.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "")}
            delay={responseDelay}
          />
        </p>
      </div>
    </motion.div>
  );
}
