"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RiArrowLeftLine, RiFileTextLine } from "react-icons/ri";
import { CONTATO } from "@/lib/contato";

const sections = [
  {
    titulo: "1. Aceitação dos Termos",
    conteudo: `Ao acessar e utilizar o site e serviços da Tappy Imob, você concorda com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.

Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas através de nosso site ou por e-mail.`,
  },
  {
    titulo: "2. Descrição dos Serviços",
    conteudo: `A Tappy Imob é uma plataforma de intermediação imobiliária que oferece:

- Listagem e busca de imóveis para venda e locação
- Conexão entre compradores, vendedores, locadores e locatários
- Avaliação de imóveis
- Consultoria imobiliária especializada
- Acompanhamento de transações imobiliárias`,
  },
  {
    titulo: "3. Cadastro e Conta",
    conteudo: `Para utilizar determinados serviços, você deverá criar uma conta fornecendo informações verdadeiras e atualizadas.

**Suas responsabilidades:**
- Manter a confidencialidade de suas credenciais
- Notificar-nos imediatamente sobre uso não autorizado
- Ser responsável por todas as atividades em sua conta
- Manter suas informações cadastrais atualizadas`,
  },
  {
    titulo: "4. Uso Aceitável",
    conteudo: `Ao utilizar nossos serviços, você concorda em não:

- Fornecer informações falsas ou enganosas
- Violar direitos de propriedade intelectual
- Transmitir vírus ou códigos maliciosos
- Interferir no funcionamento do site
- Coletar dados de outros usuários sem consentimento
- Utilizar o serviço para atividades ilegais
- Publicar conteúdo ofensivo ou discriminatório`,
  },
  {
    titulo: "5. Propriedade Intelectual",
    conteudo: `Todo o conteúdo do site, incluindo textos, imagens, logotipos, design e software, é propriedade da Tappy Imob ou de seus licenciadores e está protegido por leis de direitos autorais.

Você não pode copiar, modificar, distribuir ou utilizar nosso conteúdo sem autorização prévia por escrito.`,
  },
  {
    titulo: "6. Anúncios e Transações",
    conteudo: `A Tappy Imob atua como intermediária nas transações imobiliárias. Os anúncios são de responsabilidade de seus anunciantes.

**Importante:**
- Verificamos a veracidade das informações, mas não garantimos sua exatidão
- Recomendamos visita presencial antes de qualquer decisão
- Transações financeiras devem seguir procedimentos seguros
- Contratos devem ser revisados por profissionais qualificados`,
  },
  {
    titulo: "7. Limitação de Responsabilidade",
    conteudo: `A Tappy Imob não se responsabiliza por:

- Decisões tomadas com base nas informações do site
- Danos indiretos ou consequenciais
- Interrupções temporárias do serviço
- Ações de terceiros
- Força maior ou caso fortuito

Nossa responsabilidade está limitada ao valor efetivamente pago por nossos serviços.`,
  },
  {
    titulo: "8. Resolução de Conflitos",
    conteudo: `Qualquer controvérsia será resolvida preferencialmente por mediação. Caso não haja acordo, fica eleito o foro da Comarca de Barueri/SP, com exclusão de qualquer outro.`,
  },
  {
    titulo: "9. Disposições Gerais",
    conteudo: `- Estes termos constituem o acordo integral entre as partes
- A tolerância quanto ao descumprimento não implica renúncia
- Se qualquer disposição for considerada inválida, as demais permanecerão em vigor
- Estes termos são regidos pelas leis brasileiras`,
  },
  {
    titulo: "10. Contato",
    conteudo: `Para dúvidas sobre estes Termos de Uso:

**E-mail:** juridico@tappyimob.com.br
**Telefone:** ${CONTATO.telefone}
**Endereço:** Av. Sagitário, 138 - Sua Cidade, Barueri/SP`,
  },
];

export default function TermosPage() {
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
                <RiFileTextLine className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                  Termos de Uso
                </h1>
                <p className="text-neutral-500">Última atualização: Dezembro 2024</p>
              </div>
            </div>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Estes termos regulam o uso de nosso site e serviços. 
              Por favor, leia atentamente antes de continuar.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
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
            className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-neutral-500 text-center sm:text-left">
                Ao utilizar nossos serviços, você declara ter lido e concordado com estes Termos de Uso.
              </p>
              <Link
                href="/politicas-de-privacidade"
                className="text-sm text-[#0B2545] dark:text-sky-400 hover:underline whitespace-nowrap"
              >
                Ver Política de Privacidade →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
