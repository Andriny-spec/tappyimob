import { Fragment } from "react";

/**
 * Renderiza o pouco de formatação que a Tappy IA usa — **negrito**,
 * [links](url) e URLs soltas — sem puxar uma biblioteca de Markdown inteira.
 * Quebras de linha continuam por conta do `whitespace-pre-wrap` do balão.
 */
const PADRAO = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s)]+)/g;

export function TextoRico({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(PADRAO)) {
    const i = m.index ?? 0;
    if (i > ultimo) partes.push(texto.slice(ultimo, i));
    if (m[1]) {
      partes.push(<strong key={i} className="font-semibold text-white">{m[1]}</strong>);
    } else {
      const href = m[3] || m[4];
      partes.push(
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-orange-300 underline underline-offset-2 hover:text-orange-200 break-all">
          {m[2] || href}
        </a>
      );
    }
    ultimo = i + m[0].length;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return <Fragment>{partes}</Fragment>;
}
