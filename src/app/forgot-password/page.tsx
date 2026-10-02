"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiMailLine, RiArrowLeftLine, RiHome4Line, RiCheckLine, RiSendPlaneLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || "Se houver uma conta com este e-mail, enviaremos as instruções.");
      setSent(true);
    } catch {
      setMessage("Se houver uma conta com este e-mail, enviaremos as instruções.");
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#081733] flex items-center justify-center">
            <RiHome4Line className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-neutral-900 dark:text-white">
            Tappy<span className="text-[#0B2545] dark:text-sky-400">Imóvel</span>
          </span>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <RiCheckLine className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Verifique seu e-mail</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">{message}</p>
            <Link href="/login" className="inline-flex items-center gap-2 text-[#0B2545] dark:text-sky-400 font-medium hover:underline">
              <RiArrowLeftLine className="w-4 h-4" /> Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Esqueceu a senha?</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">E-mail</label>
                <div className="relative">
                  <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-12 h-12"
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="glow" size="xl" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <><RiSendPlaneLine className="w-5 h-5" /> Enviar link de redefinição</>
                )}
              </Button>
            </form>

            <p className="text-center mt-8">
              <Link href="/login" className="inline-flex items-center gap-2 text-[#0B2545] dark:text-sky-400 font-medium hover:underline">
                <RiArrowLeftLine className="w-4 h-4" /> Voltar ao login
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
