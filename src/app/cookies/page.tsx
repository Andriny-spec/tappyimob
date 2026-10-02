"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RiArrowLeftLine, RiSettings4Line } from "react-icons/ri";
import { CONTATO } from "@/lib/contato";

const cookieTypes = [
  {
    tipo: "Essenciais",
    cor: "bg-green-500",
    descricao: "Necessários para o funcionamento básico do site. Não podem ser desativados.",
    exemplos: ["Autenticação", "Segurança", "Preferências de sessão"],
  },
  {
    tipo: "Funcionais",
    cor: "bg-blue-500",
    descricao: "Permitem funcionalidades aprimoradas e personalização.",
    exemplos: ["Preferências de idioma", "Região", "Histórico de buscas"],
  },
  {
    tipo: "Analíticos",
    cor: "bg-amber-500",
    descricao: "Nos ajudam a entender como você utiliza o site.",
    exemplos: ["Google Analytics", "Hotjar", "Métricas de navegação"],
  },
  {
    tipo: "Marketing",
    cor: "bg-purple-500",
    descricao: "Utilizados para campanhas publicitárias relevantes.",
    exemplos: ["Facebook Pixel", "Google Ads", "Remarketing"],
  },
];

const sections = [
  {
    titulo: "O que são cookies?",
    conteudo: `Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente e fornecer informações aos proprietários do site.

Além dos cookies, também utilizamos tecnologias semelhantes como pixels, web beacons e armazenamento local.`,
  },
  {
    titulo: "Como utilizamos cookies",
    conteudo: `Utilizamos cookies para diversos fins:

- Manter você conectado à sua conta
- Lembrar suas preferências e configurações
- Entender como você utiliza nosso site
- Melhorar nossos serviços e experiência do usuário
- Mostrar anúncios relevantes
- Prevenir fraudes e garantir segurança`,
  },
  {
    titulo: "Cookies de terceiros",
    conteudo: `Alguns cookies são colocados por serviços de terceiros que aparecem em nossas páginas:

**Google Analytics:** Para análise de tráfego e comportamento
**Facebook:** Para integração social e remarketing
**Hotjar:** Para mapas de calor e análise de UX

Estes terceiros têm suas próprias políticas de privacidade.`,
  },
  {
    titulo: "Gerenciando cookies",
    conteudo: `Você pode controlar e gerenciar cookies de várias formas:

**Configurações do navegador:**
A maioria dos navegadores permite bloquear ou excluir cookies. Consulte as configurações do seu navegador.

**Opt-out de analytics:**
- Google Analytics: tools.google.com/dlpage/gaoptout
- Facebook: facebook.com/ads/preferences

**Nossa ferramenta de preferências:**
Utilize nosso banner de cookies para gerenciar suas preferências.`,
  },
  {
    titulo: "Impacto de desativar cookies",
    conteudo: `Se você optar por bloquear cookies, algumas funcionalidades podem ser afetadas:

- Não será possível manter sua sessão ativa
- Preferências não serão salvas
- Algumas páginas podem não funcionar corretamente
- Experiência personalizada será limitada`,
  },
  {
    titulo: "Atualizações desta política",
    conteudo: `Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossas práticas ou por razões operacionais, legais ou regulatórias.

Recomendamos que você revise esta página regularmente para se manter informado.`,
  },
  {
    titulo: "Contato",
    conteudo: `Se você tiver dúvidas sobre nossa Política de Cookies:

**E-mail:** privacidade@tappyimob.com.br
**Telefone:** ${CONTATO.telefone}`,
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 lg:px-8 py-16 md:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-8 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5" />
            <span>Voltar</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0B2545] flex items-center justify-center">
                <RiSettings4Line className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                  Política de Cookies
                </h1>
                <p className="text-neutral-500">Última atualização: Dezembro 2024</p>
              </div>
            </div>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Esta política explica como utilizamos cookies e tecnologias similares 
              para melhorar sua experiência em nosso site.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Cookie Types */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8">
              Tipos de cookies que utilizamos
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {cookieTypes.map((cookie, i) => (
                <motion.div
                  key={cookie.tipo}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${cookie.cor}`} />
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {cookie.tipo}
                    </h3>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    {cookie.descricao}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cookie.exemplos.map((exemplo) => (
                      <span
                        key={exemplo}
                        className="px-2.5 py-1 text-xs rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      >
                        {exemplo}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section, i) => (
              <motion.section
                key={section.titulo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  {section.titulo}
                </h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  {section.conteudo.split('\n\n').map((paragraph, j) => (
                    <p key={j} className="text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center"
          >
            <p className="text-sm text-neutral-500 mb-4">
              Ao continuar navegando em nosso site, você concorda com o uso de cookies.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/privacidade"
                className="text-sm text-[#0B2545] dark:text-sky-400 hover:underline"
              >
                Política de Privacidade
              </Link>
              <span className="text-neutral-300">•</span>
              <Link
                href="/termos"
                className="text-sm text-[#0B2545] dark:text-sky-400 hover:underline"
              >
                Termos de Uso
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
