"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <motion.div
        className="relative flex items-center justify-center w-10 h-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600"
          animate={{
            boxShadow: [
              "0 0 20px rgba(37, 211, 102, 0.3)",
              "0 0 30px rgba(37, 211, 102, 0.5)",
              "0 0 20px rgba(37, 211, 102, 0.3)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Logo icon */}
        <motion.svg
          viewBox="0 0 24 24"
          className="relative w-6 h-6 text-white z-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* House shape */}
          <motion.path
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M9 22V12h6v10"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
          />
        </motion.svg>
      </motion.div>

      {/* Logo text */}
      <div className="flex flex-col">
        <motion.span
          className="text-xl font-bold tracking-tight"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-neutral-900 dark:text-white">imo</span>
          <span className="text-orange-500">bia</span>
        </motion.span>
        <motion.span
          className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 tracking-widest uppercase -mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          CRM Imobiliário
        </motion.span>
      </div>
    </Link>
  );
}
