"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  RiLockLine, RiEyeLine, RiEyeOffLine, RiArrowLeftLine, RiHome4Line,
  RiCheckLine, RiErrorWarningLine,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Não foi possível redefinir a senha."); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <RiErrorWarningLine className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Link inválido</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">O link de redefinição está incompleto ou expirou.</p>
        <Link href="/forgot-password" className="inline-flex items-center gap-2 text-[#0B2545] dark:text-sky-400 font-medium hover:underline">
          <RiArrowLeftLine className="w-4 h-4" /> Solicitar novo link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <RiCheckLine className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Senha redefinida!</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Você já pode entrar com a nova senha. Redirecionando…</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Criar nova senha</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Escolha uma senha segura com pelo menos 6 caracteres.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Nova senha</label>
          <div className="relative">
            <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres" className="pl-12 pr-12 h-12" required />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              {show ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Confirmar nova senha</label>
          <div className="relative">
            <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a nova senha" className="pl-12 h-12" required />
          </div>
        </div>

        <Button type="submit" variant="glow" size="xl" className="w-full gap-2" disabled={loading}>
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <><RiLockLine className="w-5 h-5" /> Redefinir senha</>
          )}
        </Button>
      </form>

      <p className="text-center mt-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-[#0B2545] dark:text-sky-400 font-medium hover:underline">
          <RiArrowLeftLine className="w-4 h-4" /> Voltar ao login
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#081733] flex items-center justify-center">
            <RiHome4Line className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-neutral-900 dark:text-white">
            Tappy<span className="text-[#0B2545] dark:text-sky-400">Imóvel</span>
          </span>
        </Link>
        <Suspense fallback={<div className="text-neutral-400 text-sm">Carregando…</div>}>
          <ResetPasswordInner />
        </Suspense>
      </div>
    </div>
  );
}
