# Home SaaS e login

## Rotas

- `/`: landing do TappyImob, com nove seções e componentes em `src/components/saas/`.
- `/login`: nova apresentação, usando o mesmo `AuthProvider` e a mesma API de autenticação.
- `/portal`: home imobiliária anterior, preservada com os mesmos componentes e consultas.
- `/home`: página alternativa que já existia; permanece intacta.

## Configurações de demonstração

- `src/components/saas/config.ts`: número padrão `00000000`. Pode ser substituído por `NEXT_PUBLIC_SALES_WHATSAPP` (requer novo build).
- `src/components/saas/plans-data.ts`: nomes, preços mensais/anuais, limites e recursos dos três planos mock.
- `src/components/saas/checkout.tsx`: simula Pix, cartão e boleto. Não coleta dados bancários, não gera cobranças, não provisiona servidor e não cria assinaturas.
- O checkout oferece CRM sem site, site em hospedagem própria (implantação sob consulta) e site no servidor Tappy (adicional demonstrativo de R$ 49/mês).
- Na opção anual, o total mostra explicitamente 12 meses de CRM e, se escolhido, hospedagem. A implantação em hospedagem própria não entra no total.
- Os dados dos painéis são ilustrativos e independentes do banco real.

## Interações

Framer Motion para transições, entrada das seções, perspectiva do painel e microinterações. Lottie local em `public/saas/connections.json`, carregado quando a seção entra em vista. Abertura de aproximadamente 850 ms, uma vez por sessão. Animações respeitam `prefers-reduced-motion`.

Navegação com megamenu e menu móvel, abas navegáveis pelo teclado, FAQ expansível e checkout com gerenciamento de foco via Radix Dialog. Login com mostrar/ocultar senha, aviso de Caps Lock e recuperação de falhas de conexão.

## Validação

Build de produção concluído. ESLint passou em todos os arquivos alterados. Verificação visual e funcional em desktop (1440 px) e celular (390 px), incluindo troca dos painéis, menu móvel, cálculo do checkout, opções de hospedagem/pagamento e erros de login. O TypeScript geral ainda aponta erros preexistentes em outras áreas; os arquivos desta entrega não aparecem no relatório final.
