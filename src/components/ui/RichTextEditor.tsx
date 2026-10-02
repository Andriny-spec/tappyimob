"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiListUnordered,
  RiListOrdered,
  RiLink,
  RiLinkUnlink,
  RiH1,
  RiH2,
  RiParagraph,
  RiFormatClear,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiMagicLine,
} from "react-icons/ri";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

// Normaliza texto plano para HTML antes de enviar ao TipTap
// Preserva quebras de linha como <p> e marcadores como bullets
function normalizeToHtml(text: string): string {
  if (!text || !text.trim()) return "";
  // Se já contém tags HTML, retornar como está
  if (/<(?:p|br|ul|ol|li|h[1-6]|div|strong|em)[\/\s>]/i.test(text)) {
    return text;
  }
  // Texto plano: converter \n em parágrafos
  const lines = text.split(/\n/);
  return lines
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("");
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Digite aqui...",
  maxLength,
}: RichTextEditorProps) {
  const isProgrammaticUpdate = useRef(false);
  const normalizedValue = normalizeToHtml(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: normalizedValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (isProgrammaticUpdate.current) return;
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[120px] px-4 py-3 focus:outline-none",
      },
    },
  });

  // Atualizar conteúdo quando value mudar externamente (ex: IA gerou descrição)
  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    const html = normalizeToHtml(value);
    const currentHTML = editor.getHTML();
    if (html !== currentHTML) {
      isProgrammaticUpdate.current = true;
      editor.commands.setContent(html || "", { emitUpdate: false });
      isProgrammaticUpdate.current = false;
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("URL do link:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // Formatar texto automaticamente (quebrar em parágrafos e bullets)
  const formatText = () => {
    // Usar HTML atual ao invés de texto puro para preservar formatação existente
    const currentHtml = editor.getHTML();
    const text = editor.getText();
    if (!text.trim()) return;

    // Se já tem HTML formatado com tags estruturais, apenas limpar espaçamento
    const hasStructure = /<(?:h[1-2]|ul|ol|li|strong|em)[\s>]/i.test(currentHtml);
    if (hasStructure) {
      // Já formatado - apenas reorganizar parágrafos vazios
      const cleaned = currentHtml
        .replace(/<p><\/p>/g, '')
        .replace(/(<\/(?:h[1-2]|ul|ol|p)>)\s*(<(?:h[1-2]|ul|ol|p))/gi, '$1$2');
      editor.commands.setContent(cleaned);
      return;
    }

    // Separar por bullets existentes (•, -, *)
    const hasBullets = /[•\-\*]\s/.test(text);
    
    if (hasBullets) {
      const parts = text.split(/[•]\s*/);
      // Fallback: tentar split por "- " se não achou bullets
      const effectiveParts = parts.length > 2 ? parts : text.split(/\n\s*[-\*]\s+/);
      
      const intro = effectiveParts[0].trim();
      const items = effectiveParts.slice(1).filter(p => p.trim().length > 0);
      
      let html = '';
      
      if (intro) {
        const introSentences = intro.split(/(?<=[.;!?])\s+/).filter(s => s.trim());
        introSentences.forEach(sentence => {
          html += `<p>${sentence.trim()}</p>`;
        });
      }
      
      if (items.length > 0) {
        html += '<ul>';
        items.forEach(item => {
          const cleanItem = item.replace(/[;,.]$/, '').trim();
          if (cleanItem) {
            html += `<li>${cleanItem}</li>`;
          }
        });
        html += '</ul>';
      }
      
      editor.commands.setContent(html);
    } else {
      // Sem bullets - quebrar por frases ou por quebras de linha
      const lines = text.split(/\n+/).filter(l => l.trim());
      
      if (lines.length > 1) {
        // Tem quebras de linha - cada linha vira parágrafo
        const html = lines.map(l => `<p>${l.trim()}</p>`).join('');
        editor.commands.setContent(html);
      } else {
        // Texto corrido sem quebras - dividir por frases
        const sentences = text
          .trim()
          .split(/(?<=[.!?])\s+/)
          .filter(s => s.trim().length > 0);
        
        if (sentences.length > 1) {
          const html = sentences.map(s => `<p>${s.trim()}</p>`).join('');
          editor.commands.setContent(html);
        } else {
          // Texto sem pontuação - dividir a cada ~150 caracteres no espaço mais próximo
          const words = text.trim().split(/\s+/);
          const paragraphs: string[] = [];
          let current = '';
          
          words.forEach(word => {
            if (current.length + word.length > 150 && current.length > 0) {
              paragraphs.push(current.trim());
              current = word;
            } else {
              current += (current ? ' ' : '') + word;
            }
          });
          if (current.trim()) paragraphs.push(current.trim());
          
          const html = paragraphs.map(p => `<p>${p}</p>`).join('');
          editor.commands.setContent(html);
        }
      }
    }
  };

  const charCount = editor.getText().length;

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive("bold")
              ? "bg-[#0B2545] text-white"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          title="Negrito"
        >
          <RiBold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive("italic")
              ? "bg-[#0B2545] text-white"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          title="Itálico"
        >
          <RiItalic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive("strike")
              ? "bg-[#0B2545] text-white"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          title="Riscado"
        >
          <RiStrikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-[#0B2545] text-white"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          title="Título 1"
        >
          <RiH1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-[#0B2545] text-white"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          title="Título 2"
        >
          <RiH2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive("paragraph")
              ? "bg-[#0B2545] text-white"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          title="Parágrafo"
        >
          <RiParagraph className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive("bulletList")
              ? "bg-[#0B2545] text-white"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          title="Lista"
        >
          <RiListUnordered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive("orderedList")
              ? "bg-[#0B2545] text-white"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          title="Lista numerada"
        >
          <RiListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={addLink}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive("link")
              ? "bg-[#0B2545] text-white"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          title="Adicionar link"
        >
          <RiLink className="w-4 h-4" />
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            title="Remover link"
          >
            <RiLinkUnlink className="w-4 h-4" />
          </button>
        )}

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          title="Limpar formatação"
        >
          <RiFormatClear className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={formatText}
          className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition-colors"
          title="Formatar texto automaticamente"
        >
          <RiMagicLine className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-30"
          title="Desfazer"
        >
          <RiArrowGoBackLine className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-30"
          title="Refazer"
        >
          <RiArrowGoForwardLine className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Footer com contador */}
      {maxLength && (
        <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <p className={`text-xs ${charCount > maxLength ? "text-red-500" : "text-neutral-400"}`}>
            {charCount}/{maxLength} caracteres
          </p>
        </div>
      )}
    </div>
  );
}
