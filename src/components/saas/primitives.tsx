"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { salesLink } from "./config";

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link
      href="/"
      className={`saas-brand ${small ? "saas-brand-small" : ""}`}
      aria-label="TappyImob — início"
    >
      <Image
        src="/logo.png"
        alt="TappyImob"
        width={1200}
        height={263}
        sizes="200px"
        priority
      />
    </Link>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={false}
      whileInView={reduced ? undefined : { y: [20, 0], opacity: [0.65, 1] }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <div className={`saas-eyebrow ${light ? "saas-eyebrow-light" : ""}`}>
      <span />
      {children}
    </div>
  );
}

export function SalesButton({
  children = "Agendar demonstração",
  secondary = false,
  message,
  className = "",
}: {
  children?: ReactNode;
  secondary?: boolean;
  message?: string;
  className?: string;
}) {
  return (
    <a
      href={salesLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`saas-button ${secondary ? "saas-button-outline" : "saas-button-green"} ${className}`}
    >
      {children}
      <ArrowUpRight size={17} />
    </a>
  );
}
