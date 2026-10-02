"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Mantém a tela de WhatsApp atualizada sem recarregar a página.
 *
 * Funciona por consulta periódica ao WAHA (via API do próprio site), não por
 * webhook: roda igual na VPS e na Vercel, sem servidor de tempo real. Para não
 * pesar no servidor nem na conta da Vercel, o ritmo se adapta:
 *
 * - só consulta com a aba VISÍVEL (aba em segundo plano = zero requisições);
 * - conversa aberta: começa em 5s e vai espaçando até 30s enquanto nada muda;
 *   chegou mensagem ou a pessoa enviou algo → volta para 5s;
 * - lista de conversas: a cada 20s, só a primeira página;
 * - nunca dispara uma consulta enquanto a anterior não terminou;
 * - consulta leve (15 mensagens, sem baixar mídia); só baixa mídia quando
 *   chegou mensagem nova com anexo.
 */

const MSG_MIN_MS = 5_000;
const MSG_MAX_MS = 30_000;
const CHATS_MS = 20_000;
const LOTE_MENSAGENS = 15;

export type MensagemBruta = {
  id: string;
  timestamp: number;
  fromMe?: boolean;
  body?: string;
  hasMedia?: boolean;
};

type Opcoes<M extends MensagemBruta, C> = {
  /** Ex.: "/api/admin/waha/sessions" */
  base: string;
  sessao: string | null;
  chatId: string | null;
  /** Falso enquanto a carga inicial da conversa não terminou. */
  pronto: boolean;
  /** Ids das mensagens já na tela, para separar o que é novo. */
  idsConhecidos: () => Set<string>;
  aoNovasMensagens: (novas: M[]) => void;
  /** Recebe a primeira página de conversas, para mesclar com a lista. */
  aoAtualizarChats: (primeiraPagina: C[]) => void;
  chatsPorPagina: number;
};

const abaVisivel = () => typeof document === "undefined" || document.visibilityState === "visible";

export function useChatAoVivo<M extends MensagemBruta, C>(op: Opcoes<M, C>) {
  // Callbacks em ref: o laço não reinicia a cada render da página
  const ref = useRef(op);
  ref.current = op;

  const intervaloMsg = useRef(MSG_MIN_MS);
  const timerMsg = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emAndamento = useRef(false);

  /** Volta ao ritmo rápido — chamar depois de enviar mensagem. */
  const acordar = useCallback(() => {
    intervaloMsg.current = MSG_MIN_MS;
  }, []);

  // ---------- Mensagens da conversa aberta ----------
  useEffect(() => {
    const { sessao, chatId, pronto, base } = op;
    if (!sessao || !chatId || !pronto) return;

    let ativo = true;
    intervaloMsg.current = MSG_MIN_MS;
    const url = (baixarMidia: boolean) =>
      `${base}/${sessao}/chats/${encodeURIComponent(chatId)}/messages?limit=${LOTE_MENSAGENS}&downloadMedia=${baixarMidia}`;

    const agendar = () => {
      if (!ativo) return;
      timerMsg.current = setTimeout(rodada, intervaloMsg.current);
    };

    const rodada = async () => {
      if (!ativo) return;
      if (!abaVisivel() || emAndamento.current) return agendar();
      emAndamento.current = true;
      try {
        const res = await fetch(url(false), { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        let lote: M[] = await res.json();
        const conhecidos = ref.current.idsConhecidos();
        let novas = lote.filter((m) => !conhecidos.has(m.id));

        // Anexo novo: uma segunda consulta, agora baixando a mídia
        if (novas.some((m) => m.hasMedia)) {
          const comMidia = await fetch(url(true), { cache: "no-store" });
          if (comMidia.ok) {
            lote = await comMidia.json();
            const ids = new Set(novas.map((m) => m.id));
            novas = lote.filter((m) => ids.has(m.id));
          }
        }

        if (!ativo) return;
        if (novas.length) {
          ref.current.aoNovasMensagens(novas.sort((a, b) => a.timestamp - b.timestamp));
          intervaloMsg.current = MSG_MIN_MS;
        } else {
          intervaloMsg.current = Math.min(MSG_MAX_MS, Math.round(intervaloMsg.current * 1.5));
        }
      } catch {
        // Falha (WAHA reiniciando, rede): espaça sem derrubar a tela
        intervaloMsg.current = MSG_MAX_MS;
      } finally {
        emAndamento.current = false;
        agendar();
      }
    };

    // Voltou para a aba: confere na hora em vez de esperar o timer
    const aoVoltar = () => {
      if (!abaVisivel()) return;
      intervaloMsg.current = MSG_MIN_MS;
      if (timerMsg.current) clearTimeout(timerMsg.current);
      rodada();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    agendar();

    return () => {
      ativo = false;
      if (timerMsg.current) clearTimeout(timerMsg.current);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [op.base, op.sessao, op.chatId, op.pronto]);

  // ---------- Lista de conversas ----------
  useEffect(() => {
    const { sessao, base } = op;
    if (!sessao) return;
    let ativo = true;
    let ocupado = false;

    const rodada = async () => {
      if (!ativo || ocupado || !abaVisivel()) return;
      ocupado = true;
      try {
        const res = await fetch(`${base}/${sessao}/chats?limit=${ref.current.chatsPorPagina}&offset=0`, { cache: "no-store" });
        if (res.ok && ativo) ref.current.aoAtualizarChats(await res.json());
      } catch {
        // tenta de novo na próxima volta
      } finally {
        ocupado = false;
      }
    };

    const timer = setInterval(rodada, CHATS_MS);
    const aoVoltar = () => abaVisivel() && rodada();
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      ativo = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [op.base, op.sessao]);

  return { acordar };
}

/**
 * Mescla a primeira página atualizada com a lista já carregada (que pode ter
 * várias páginas pela rolagem): atualiza as existentes, põe as novas no topo
 * e reordena pela última mensagem.
 */
export function mesclarChats<C extends { id: string; timestamp?: number }>(atual: C[], primeiraPagina: C[]): C[] {
  const porId = new Map(atual.map((c) => [c.id, c]));
  for (const c of primeiraPagina) porId.set(c.id, { ...porId.get(c.id), ...c });
  return [...porId.values()].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}
