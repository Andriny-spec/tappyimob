"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RiArrowLeftLine, RiShieldCheckLine } from "react-icons/ri";
import { CONTATO } from "@/lib/contato";

const sections = [
  {
    titulo: "1. Introdução",
    conteudo: `A Tappy Imob ("nós", "nosso" ou "empresa") valoriza a privacidade de seus usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nosso site e serviços.

Esta política está em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e demais normas aplicáveis.`,
  },
  {
    titulo: "2. Dados que Coletamos",
    conteudo: `Podemos coletar os seguintes tipos de dados pessoais:

**Dados fornecidos por você:**
- Nome completo, CPF, RG
- E-mail, telefone e endereço
- Informações sobre imóveis (para cadastro de propriedades)
- Preferências de busca e interesse em imóveis
- Documentos necessários para transações imobiliárias

**Dados coletados automaticamente:**
- Endereço IP e dados de navegação
- Cookies e tecnologias similares
- Tipo de dispositivo e navegador
- Páginas visitadas e tempo de permanência
- Localização aproximada`,
  },
  {
    titulo: "3. Finalidade do Tratamento",
    conteudo: `Utilizamos seus dados pessoais para as seguintes finalidades:

- Prestação de serviços de intermediação imobiliária
- Comunicação sobre imóveis de seu interesse
- Agendamento e acompanhamento de visitas
- Envio de propostas e documentação
- Análise de perfil para recomendação de imóveis
- Cumprimento de obrigações legais e regulatórias
- Melhoria contínua de nossos serviços
- Envio de comunicações de marketing (com seu consentimento)
- Prevenção de fraudes e segurança da plataforma`,
  },
  {
    titulo: "4. Base Legal",
    conteudo: `O tratamento de dados pessoais pela Tappy Imob é fundamentado nas seguintes bases legais da LGPD:

- **Consentimento:** quando você nos fornece dados voluntariamente
- **Execução de contrato:** para prestação dos serviços contratados
- **Obrigação legal:** cumprimento de exigências legais e regulatórias
- **Legítimo interesse:** para melhorar nossos serviços e comunicação
- **Proteção ao crédito:** quando aplicável em transações`,
  },
  {
    titulo: "5. Compartilhamento de Dados",
    conteudo: `Seus dados pessoais podem ser compartilhados com:

- **Corretores parceiros:** para intermediação de negócios
- **Cartórios e órgãos públicos:** quando necessário para transações
- **Prestadores de serviço:** que nos auxiliam na operação (hospedagem, e-mail, analytics)
- **Parceiros de negócio:** com seu consentimento prévio

**Não vendemos seus dados pessoais a terceiros.** Todo compartilhamento respeita os princípios da LGPD e é realizado apenas quando necessário.`,
  },
  {
    titulo: "6. Armazenamento e Segurança",
    conteudo: `Adotamos medidas técnicas e organizacionais para proteger seus dados:

- Criptografia de dados em trânsito e em repouso
- Controle de acesso restrito a colaboradores autorizados
- Monitoramento contínuo de segurança
- Backups regulares em ambiente seguro
- Servidores protegidos com firewalls e sistemas de detecção de intrusão

Seus dados são armazenados pelo tempo necessário para cumprir as finalidades descritas nesta política ou conforme exigido por lei.`,
  },
  {
    titulo: "7. Cookies",
    conteudo: `Utilizamos cookies e tecnologias similares para:

- **Cookies essenciais:** necessários para o funcionamento do site
- **Cookies de desempenho:** para analisar como você usa o site
- **Cookies de funcionalidade:** para lembrar suas preferências
- **Cookies de marketing:** para exibir conteúdo relevante (com consentimento)

Você pode gerenciar suas preferências de cookies através das configurações do seu navegador. A desativação de alguns cookies pode afetar a funcionalidade do site.`,
  },
  {
    titulo: "8. Seus Direitos (LGPD)",
    conteudo: `De acordo com a LGPD, você tem direito a:

- **Confirmação** da existência de tratamento de dados
- **Acesso** aos seus dados pessoais
- **Correção** de dados incompletos ou desatualizados
- **Anonimização, bloqueio ou eliminação** de dados desnecessários
- **Portabilidade** dos dados a outro fornecedor
- **Eliminação** dos dados tratados com seu consentimento
- **Informação** sobre compartilhamento de dados
- **Revogação** do consentimento a qualquer momento

Para exercer seus direitos, entre em contato conosco pelos canais indicados nesta política.`,
  },
  {
    titulo: "9. Retenção de Dados",
    conteudo: `Mantemos seus dados pessoais pelo período necessário para:

- Cumprir as finalidades para as quais foram coletados
- Atender obrigações legais e regulatórias
- Exercer direitos em processos judiciais ou administrativos
- Proteger nossos interesses legítimos

Após o período de retenção, os dados são eliminados de forma segura ou anonimizados.`,
  },
  {
    titulo: "10. Alterações nesta Política",
    conteudo: `Esta política pode ser atualizada periodicamente. Notificaremos sobre alterações significativas através de:

- Aviso em destaque no site
- Comunicação por e-mail (quando aplicável)
- Atualização da data de última modificação

Recomendamos que você revise esta política regularmente.`,
  },
  {
    titulo: "11. Contato e Encarregado (DPO)",
    conteudo: `Para dúvidas, solicitações ou reclamações sobre o tratamento de seus dados pessoais:

**Encarregado de Proteção de Dados (DPO):**
**E-mail:** privacidade@tappyimob.com.br
**Telefone:** ${CONTATO.telefone}
**Endereço:** Av. Sagitário, 138 - Sua Cidade, Barueri/SP

Caso não fique satisfeito com nossa resposta, você pode entrar em contato com a Autoridade Nacional de Proteção de Dados (ANPD).`,
  },
];

export default function PoliticasPrivacidadePage() {
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
                <p className="text-neutral-500">Última atualização: Fevereiro 2026</p>
              </div>
            </div>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Saiba como coletamos, usamos e protegemos suas informações pessoais 
              em conformidade com a LGPD.
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
                Ao utilizar nossos serviços, você declara ter lido e concordado com esta Política de Privacidade.
              </p>
              <Link
                href="/termos"
                className="text-sm text-[#0B2545] dark:text-sky-400 hover:underline whitespace-nowrap"
              >
                Ver Termos de Uso →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
