"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiMicLine, RiMicOffLine } from "react-icons/ri";

interface MicButtonProps {
  onToggle?: (active: boolean) => void;
  initialActive?: boolean;
}

export function MicButton({ onToggle, initialActive = false }: MicButtonProps) {
  const [active, setActive] = useState(initialActive);

  function toggle() {
    const next = !active;
    setActive(next);
    onToggle?.(next);
  }

  return (
    <div className="relative flex items-center justify-center w-44 h-44">
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: active ? 1 : 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: active
            ? "radial-gradient(circle, rgba(239,68,68,0.25) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(37, 211, 102,0.2) 0%, transparent 70%)",
        }}
      />

      {/* Ripple rings */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            border: `1.5px solid ${active ? "rgba(239,68,68,0.35)" : "rgba(37, 211, 102,0.35)"}`,
          }}
          animate={{
            width: active ? [84, 160 + i * 28] : [84, 140 + i * 22],
            height: active ? [84, 160 + i * 28] : [84, 140 + i * 22],
            opacity: [0.75, 0],
          }}
          transition={{
            duration: active ? 1.1 : 2.6,
            repeat: Infinity,
            delay: i * (active ? 0.28 : 0.65),
            ease: "easeOut",
          }}
        />
      ))}

      {/* Sound-wave bars (visible when active) */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute flex items-end gap-[3px]"
            style={{ bottom: "6px" }}
          >
            {[3, 6, 10, 6, 3].map((h, i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-red-400/70"
                animate={{ height: [h, h + 8 + Math.random() * 6, h] }}
                transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                style={{ height: h }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        className="relative w-[84px] h-[84px] rounded-full flex items-center justify-center z-10 cursor-pointer"
        style={{
          background: active
            ? "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
            : "linear-gradient(135deg, #25D366 0%, #25D366 100%)",
          boxShadow: active
            ? "0 0 0 5px rgba(239,68,68,0.12), 0 10px 40px rgba(239,68,68,0.45)"
            : "0 0 0 5px rgba(37, 211, 102,0.12), 0 10px 40px rgba(37, 211, 102,0.45)",
        }}
      >
        {/* Inner ring highlight */}
        <span
          className="absolute inset-[3px] rounded-full pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)" }}
        />

        <AnimatePresence mode="wait">
          {active ? (
            <motion.span
              key="off"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              transition={{ duration: 0.18 }}
            >
              <RiMicOffLine className="w-9 h-9 text-white drop-shadow" />
            </motion.span>
          ) : (
            <motion.span
              key="on"
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -45 }}
              transition={{ duration: 0.18 }}
            >
              <RiMicLine className="w-9 h-9 text-white drop-shadow" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
