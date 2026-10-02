"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Brand } from "@/components/saas/primitives";
import { salesLink } from "@/components/saas/config";
import { FaFacebookF, FaGithub, FaInstagram } from "react-icons/fa";
import { TappyLoader } from "@/components/saas/loader";
import { SaasFloating } from "@/components/saas/floating";
import "@/components/saas/saas.css";

// Provedores de login social. A autenticação OAuth de cada um ainda não está
// ligada no backend: por enquanto o botão avisa que está chegando.
const SOCIAIS = [
  { id: "facebook", nome: "Facebook", Icone: FaFacebookF },
  { id: "github", nome: "GitHub", Icone: FaGithub },
  { id: "instagram", nome: "Instagram", Icone: FaInstagram },
] as const;

export default function LoginPage() {
  const { login, isLoading: authLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [capsLock, setCapsLock] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [avisoSocial, setAvisoSocial] = useState("");
  const [recuperar, setRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [enviandoLink, setEnviandoLink] = useState(false);
  const [retornoRecuperar, setRetornoRecuperar] = useState<{ ok: boolean; texto: string } | null>(null);

  // Recuperação no próprio login. Não é um <form> porque fica dentro do
  // formulário de login (form dentro de form não é HTML válido).
  async function enviarRecuperacao() {
    const alvo = emailRecuperar.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alvo)) {
      setRetornoRecuperar({ ok: false, texto: "Digite um e-mail válido." });
      return;
    }
    setEnviandoLink(true);
    setRetornoRecuperar(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: alvo }),
      });
      const data = await res.json().catch(() => ({}));
      setRetornoRecuperar({
        ok: res.ok,
        texto: res.ok
          ? data.message || "Se houver uma conta com este e-mail, enviamos um link para criar uma nova senha."
          : data.error || "Não foi possível enviar agora. Tente de novo em instantes.",
      });
    } catch {
      setRetornoRecuperar({ ok: false, texto: "Sem conexão. Verifique a internet e tente de novo." });
    } finally {
      setEnviandoLink(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await login(email.trim(), password);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
      } else {
        // Cobre a troca de página até o painel assumir
        setEntrando(true);
      }
      // AuthProvider mantém o redirecionamento conforme o perfil da conta.
    } catch {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      setSubmitting(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="saas saas-login">
        <aside className="saas-login-brand-panel">
          <div className="saas-hero-grid" aria-hidden="true" />
          <Brand />
          <div className="saas-login-brand-content">
            <div className="saas-login-eyebrow">
              <span className="saas-live-dot" /> SEU PRÓXIMO NÍVEL, TODOS OS
              DIAS.
            </div>
            <h2>
              Boas conexões.
              <br />
              Grandes negócios.
              <br />
              <span>O seu lugar é aqui.</span>
            </h2>
            <p>
              Seu time, seus imóveis e suas oportunidades.
              <br />
              Tudo pronto para o próximo capítulo.
            </p>
            <div className="saas-login-scene" aria-hidden="true">
              <div className="saas-login-orbit orbit-one" />
              <div className="saas-login-orbit orbit-two" />
              <div className="saas-login-symbol">
                <Image
                  src="/saas/tappy-symbol.png"
                  alt=""
                  width={170}
                  height={170}
                  priority
                />
              </div>
              <div className="saas-login-glass-card">
                <span className="saas-login-card-icon">
                  <Sparkles size={20} />
                </span>
                <span>
                  <strong>Mais foco no que importa.</strong>
                  <small>O resto, a gente conecta.</small>
                </span>
                <Check size={16} />
              </div>
              <span className="saas-login-mini-tag tag-crm">
                <span /> CRM & leads
              </span>
              <span className="saas-login-mini-tag tag-imoveis">
                <span /> Gestão de imóveis
              </span>
              <span className="saas-login-mini-tag tag-ai">
                <Sparkles size={13} /> Tappy IA
              </span>
            </div>
          </div>
          <div className="saas-login-brand-bottom">
            <span>UMA PLATAFORMA. NOVAS POSSIBILIDADES.</span>
            <span>FEITO PARA CONECTAR ↗</span>
          </div>
        </aside>
        <div className="saas-login-form-panel">
          <header>
            <div className="saas-login-mobile-brand">
              <Brand small />
            </div>
            <Link href="/" className="saas-back-link">
              <ArrowLeft size={14} /> Voltar ao site
            </Link>
          </header>
          <main className="saas-login-form-main">
            <motion.div
              className="saas-login-form-wrap"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="saas-login-key">
                <KeyRound size={23} />
              </div>
              <span className="saas-login-form-eyebrow">
                SEU WORKSPACE ESTÁ AQUI
              </span>
              <h1>Bom ter você de volta.</h1>
              <p>
                Acesse sua conta e faça o próximo
                <br className="saas-desktop-br" /> negócio acontecer.
              </p>
              <form onSubmit={handleSubmit} aria-busy={submitting}>
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="saas-login-error"
                      role="alert"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <AlertCircle size={17} />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <label htmlFor="login-email">Seu e-mail</label>
                <div className="saas-login-input">
                  <Mail size={18} />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@suaimobiliaria.com.br"
                    disabled={submitting}
                  />
                </div>
                <div className="saas-login-password-label">
                  <label htmlFor="login-password">Sua senha</label>
                  <button
                    type="button"
                    className="saas-login-forgot"
                    aria-expanded={recuperar}
                    aria-controls="login-recuperar"
                    onClick={() => {
                      setRecuperar((v) => !v);
                      setEmailRecuperar((atual) => atual || email);
                      setRetornoRecuperar(null);
                    }}
                  >
                    {recuperar ? "Voltar à senha" : "Esqueceu a senha?"}
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {recuperar && (
                    <motion.div
                      id="login-recuperar"
                      className="saas-login-recover"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="saas-login-recover-inner">
                        <strong>Vamos recuperar seu acesso</strong>
                        <p>Enviamos um link para você criar uma nova senha.</p>
                        <div className="saas-login-recover-row">
                          <div className="saas-login-input">
                            <Mail size={18} />
                            <input
                              type="email"
                              autoComplete="email"
                              value={emailRecuperar}
                              onChange={(e) => setEmailRecuperar(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  enviarRecuperacao();
                                }
                              }}
                              placeholder="E-mail da sua conta"
                              aria-label="E-mail da sua conta"
                            />
                          </div>
                          <button type="button" onClick={enviarRecuperacao} disabled={enviandoLink} className="saas-login-recover-send">
                            {enviandoLink ? <LoaderCircle size={17} className="saas-spin" /> : <ArrowRight size={17} />}
                            <span>Enviar link</span>
                          </button>
                        </div>
                        {retornoRecuperar && (
                          <p role="status" className={`saas-login-recover-msg ${retornoRecuperar.ok ? "ok" : "erro"}`}>
                            {retornoRecuperar.ok ? <Check size={15} /> : <AlertCircle size={15} />}
                            {retornoRecuperar.texto}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="saas-login-input">
                  <LockKeyhole size={18} />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                    onBlur={() => setCapsLock(false)}
                    placeholder="Digite sua senha"
                    disabled={submitting}
                    aria-describedby={capsLock ? "caps-lock-note" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {capsLock && (
                  <p id="caps-lock-note" className="saas-caps-warning">
                    Caps Lock está ativado.
                  </p>
                )}
                <button
                  type="submit"
                  className="saas-button saas-button-green saas-login-submit"
                  disabled={submitting || authLoading || Boolean(user)}
                >
                  {submitting || authLoading || user ? (
                    <>
                      <LoaderCircle size={18} className="saas-spin" />
                      {authLoading
                        ? "Preparando seu acesso..."
                        : "Entrando no seu workspace..."}
                    </>
                  ) : (
                    <>
                      Entrar no meu workspace
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <span className="saas-login-secure">
                  <ShieldCheck size={14} /> Seu próximo negócio começa com um
                  acesso seguro.
                </span>
              </form>
              <div className="saas-login-divider">ou entre com</div>
              <div className="saas-login-social">
                {SOCIAIS.map(({ id, nome, Icone }) => (
                  <button
                    key={id}
                    type="button"
                    className={id}
                    onClick={() => setAvisoSocial(`Login com ${nome} chega em breve. Por enquanto, use seu e-mail e senha.`)}
                    aria-label={`Entrar com ${nome}`}
                  >
                    <Icone size={17} />
                    <span>{nome}</span>
                  </button>
                ))}
              </div>
              {avisoSocial && (
                <p className="saas-login-social-note" role="status">
                  {avisoSocial}
                </p>
              )}
              <div className="saas-login-new">
                <span>Ainda não faz parte da Tappy?</span>
                <Link href="/#precos">
                  Encontre o seu plano <ArrowUpRight size={14} />
                </Link>
              </div>
              <a
                href={salesLink(
                  "Olá! Preciso de ajuda para acessar minha conta TappyImob.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="saas-login-help"
              >
                <MessageCircle size={15} /> Precisa de uma mão? Fale com a
                gente.
              </a>
            </motion.div>
          </main>
          <footer>
            <span>© {new Date().getFullYear()} TappyImob</span>
            <div>
              <Link href="/termos">Termos</Link>
              <Link href="/privacidade">Privacidade</Link>
            </div>
          </footer>
        </div>
        <SaasFloating />
        {entrando ? <TappyLoader modo="entrando" mensagem="Entrando no seu workspace" /> : <TappyLoader />}
      </div>
    </MotionConfig>
  );
}
