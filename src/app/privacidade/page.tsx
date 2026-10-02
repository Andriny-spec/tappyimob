"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RiArrowLeftLine, RiShieldCheckLine } from "react-icons/ri";
import { CONTATO } from "@/lib/contato";

const sections = [
  {
    titulo: "1. Informações que coletamos",
    conteudo: `Coletamos informações que você nos fornece diretamente, como quando você cria uma conta, entra em contato conosco ou utiliza nossos serviços.

**Dados pessoais:**
- Nome completo
- Endereço de e-mail
- Número de telefone
- CPF (quando necessário para transações)

**Dados de navegação:**
- Endereço IP
- Tipo de navegador
- Páginas visitadas
- Tempo de permanência`,
  },
  {
    titulo: "2. Como utilizamos suas informações",
    conteudo: `Utilizamos as informações coletadas para:

- Fornecer, manter e melhorar nossos serviços
- Processar transações e enviar notificações relacionadas
- Enviar comunicações de marketing (com seu consentimento)
- Responder às suas solicitações e fornecer suporte
- Personalizar sua experiência em nosso site
- Cumprir obrigações legais e regulatórias`,
  },
  {
    titulo: "3. Compartilhamento de dados",
    conteudo: `Não vendemos suas informações pessoais. Podemos compartilhar seus dados apenas nas seguintes situações:

- Com prestadores de serviços que nos auxiliam nas operações
- Para cumprir obrigações legais ou ordens judiciais
- Para proteger direitos, propriedade ou segurança
- Com seu consentimento expresso para finalidades específicas`,
  },
  {
    titulo: "4. Segurança dos dados",
    conteudo: `Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.

Utilizamos criptografia SSL/TLS para proteger a transmissão de dados e mantemos procedimentos de segurança rigorosos em nossos sistemas.`,
  },
  {
    titulo: "5. Seus direitos",
    conteudo: `De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem direito a:

- Acessar seus dados pessoais
- Corrigir dados incompletos ou desatualizados
- Solicitar a exclusão de seus dados
- Revogar o consentimento a qualquer momento
- Solicitar a portabilidade dos dados
- Obter informações sobre o compartilhamento de dados`,
  },
  {
    titulo: "6. Retenção de dados",
    conteudo: `Mantemos suas informações pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.`,
  },
  {
    titulo: "7. Contato",
    conteudo: `Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato conosco:

**E-mail:** privacidade@tappyimob.com.br
**Telefone:** ${CONTATO.telefone}
**Endereço:** Av. Sagitário, 138 - Sua Cidade, Barueri/SP`,
  },
];

export default function PrivacidadePage() {
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
                <RiShieldCheckLine className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                  Política de Privacidade
                </h1>
                <p className="text-neutral-500">Última atualização: Dezembro 2024</p>
              </div>
            </div>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Sua privacidade é importante para nós. Esta política descreve como coletamos, 
              usamos e protegemos suas informações pessoais.
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
            <p className="text-sm text-neutral-500 text-center">
              Ao utilizar nossos serviços, você concorda com esta Política de Privacidade.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
