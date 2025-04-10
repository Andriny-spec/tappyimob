'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  HelpCircle,
  Search,
  MessageSquare,
  Phone,
  Mail,
  FileQuestion,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  Send
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Dados mockados para tickets
const tickets = [
  {
    id: 'TIC-001',
    assunto: 'Problemas ao acessar documentos',
    data: '10/06/2024',
    status: 'aberto',
    prioridade: 'média',
    categoria: 'Acesso',
    descricao: 'Não consigo acessar os documentos do meu contrato de aluguel. Aparece uma mensagem de erro.',
    respostas: [
      {
        autor: 'Suporte',
        data: '10/06/2024 - 15:45',
        mensagem: 'Obrigado por reportar o problema. Estamos verificando o que pode estar acontecendo com o acesso aos documentos.'
      }
    ]
  },
  {
    id: 'TIC-002',
    assunto: 'Dúvidas sobre valor do IPTU',
    data: '05/06/2024',
    status: 'pendente',
    prioridade: 'baixa',
    categoria: 'Financeiro',
    descricao: 'Gostaria de entender como é feito o cálculo do IPTU do meu imóvel e se este valor está incluído no aluguel.',
    respostas: [
      {
        autor: 'Suporte',
        data: '05/06/2024 - 10:20',
        mensagem: 'Recebemos sua dúvida e encaminhamos para o departamento financeiro.'
      },
      {
        autor: 'Departamento Financeiro',
        data: '06/06/2024 - 14:30',
        mensagem: 'O valor do IPTU não está incluído no aluguel. O pagamento é feito separadamente e pode ser parcelado conforme regras da prefeitura. Estamos aguardando o detalhamento do seu caso para fornecer informações específicas.'
      }
    ]
  },
  {
    id: 'TIC-003',
    assunto: 'Solicitação de reparo - Vazamento',
    data: '01/06/2024',
    status: 'resolvido',
    prioridade: 'alta',
    categoria: 'Manutenção',
    descricao: 'Há um vazamento na cozinha do apartamento que estou alugando. Preciso de um encanador com urgência.',
    respostas: [
      {
        autor: 'Suporte',
        data: '01/06/2024 - 09:15',
        mensagem: 'Recebemos sua solicitação e já estamos providenciando um técnico para verificar o vazamento.'
      },
      {
        autor: 'Manutenção',
        data: '01/06/2024 - 11:30',
        mensagem: 'Agendamos uma visita técnica para hoje, entre 14h e 16h. O técnico entrará em contato quando estiver a caminho.'
      },
      {
        autor: 'Manutenção',
        data: '01/06/2024 - 17:45',
        mensagem: 'O reparo foi concluído com sucesso. O vazamento foi causado por uma conexão solta na tubulação sob a pia.'
      },
      {
        autor: 'Você',
        data: '02/06/2024 - 08:20',
        mensagem: 'Confirmo que o problema foi resolvido. Obrigado pela rapidez no atendimento!'
      }
    ]
  }
];

// Perguntas frequentes
const faq = [
  {
    pergunta: 'Como posso agendar uma visita a um imóvel?',
    resposta: 'Para agendar uma visita a um imóvel, você pode: 1) Na página do imóvel desejado, clicar no botão "Agendar Visita"; 2) Entrar em contato diretamente com o corretor responsável via chat; ou 3) Ligar para nossa central de atendimento. Os agendamentos são confirmados em até 4 horas úteis.'
  },
  {
    pergunta: 'Quais documentos são necessários para alugar um imóvel?',
    resposta: 'Para alugar um imóvel, geralmente são necessários: Documentos pessoais (RG e CPF), comprovante de renda (3x o valor do aluguel), comprovante de residência atual, comprovante de estado civil e fiador ou seguro fiança. Os requisitos podem variar conforme o proprietário e a imobiliária.'
  },
  {
    pergunta: 'Como funciona o processo de compra de um imóvel?',
    resposta: 'O processo de compra inclui: 1) Escolha do imóvel; 2) Proposta de compra; 3) Análise de documentação; 4) Financiamento (se aplicável); 5) Assinatura de contrato; 6) Pagamento e transferência. Nossa equipe acompanha cada etapa para garantir segurança na transação.'
  },
  {
    pergunta: 'O que fazer em caso de problemas no imóvel alugado?',
    resposta: 'Em caso de problemas no imóvel alugado, abra um chamado na seção de Suporte, selecionando a categoria "Manutenção". Problemas urgentes como vazamentos e problemas elétricos são atendidos com prioridade. Você também pode entrar em contato pelo telefone de emergência disponível 24h.'
  },
  {
    pergunta: 'Como posso renovar meu contrato de aluguel?',
    resposta: 'Para renovar seu contrato de aluguel, entre em contato com seu corretor com pelo menos 30 dias de antecedência ao término do contrato atual. Será realizada uma reavaliação do imóvel e possíveis ajustes no valor do aluguel, conforme mercado e índices contratuais.'
  },
  {
    pergunta: 'Como funciona o pagamento de aluguel e taxas?',
    resposta: 'O pagamento do aluguel pode ser feito via boleto bancário, débito automático ou PIX, conforme definido em contrato. As taxas como IPTU e condomínio podem ser pagas separadamente ou incluídas no valor, dependendo do acordo. Os comprovantes podem ser enviados pelo sistema.'
  }
];

export default function SuporteClientePage() {
  const [abaSelecionada, setAbaSelecionada] = useState('tickets');
  const [ticketSelecionado, setTicketSelecionado] = useState<string | null>(null);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [modalNovoTicket, setModalNovoTicket] = useState(false);
  const [novaMensagem, setNovaMensagem] = useState('');
  
  // Filtrar tickets
  const ticketsFiltrados = tickets.filter(ticket => {
    // Filtro por status
    if (filtroStatus !== 'todos' && ticket.status !== filtroStatus) return false;
    
    // Filtro por texto
    if (filtroBusca && !ticket.assunto.toLowerCase().includes(filtroBusca.toLowerCase()) &&
        !ticket.id.toLowerCase().includes(filtroBusca.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Obter detalhes do ticket selecionado
  const ticketAtual = tickets.find(t => t.id === ticketSelecionado);
  
  return (
    <PageContainer
      title="Suporte ao Cliente"
      subtitle="Solicitações, dúvidas e ajuda"
    >
      <div className="space-y-6">
        {/* Abas principais */}
        <Tabs 
          value={abaSelecionada} 
          onValueChange={setAbaSelecionada} 
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="tickets">Meus Chamados</TabsTrigger>
              <TabsTrigger value="faq">Perguntas Frequentes</TabsTrigger>
              <TabsTrigger value="contato">Contatos</TabsTrigger>
            </TabsList>
            
            {abaSelecionada === 'tickets' && (
              <Button onClick={() => setModalNovoTicket(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Chamado
              </Button>
            )}
          </div>
          
          {/* Conteúdo da aba "Meus Chamados" */}
          <TabsContent value="tickets" className="space-y-4">
            {!ticketSelecionado ? (
              <>
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar chamados..."
                      className="pl-8"
                      value={filtroBusca}
                      onChange={(e) => setFiltroBusca(e.target.value)}
                    />
                  </div>
                  <Select
                    value={filtroStatus}
                    onValueChange={setFiltroStatus}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="aberto">Abertos</SelectItem>
                      <SelectItem value="pendente">Pendentes</SelectItem>
                      <SelectItem value="resolvido">Resolvidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Lista de tickets */}
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle>Meus Chamados</CardTitle>
                    <CardDescription>
                      Total: {ticketsFiltrados.length} chamados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {ticketsFiltrados.length > 0 ? (
                      <div className="divide-y">
                        {ticketsFiltrados.map((ticket) => (
                          <div 
                            key={ticket.id}
                            className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setTicketSelecionado(ticket.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {ticket.id}
                                  </span>
                                  <Badge className={
                                    ticket.status === 'aberto' ? 'bg-blue-500' :
                                    ticket.status === 'pendente' ? 'bg-amber-500' :
                                    'bg-green-500'
                                  }>
                                    {ticket.status === 'aberto' ? 'Aberto' :
                                     ticket.status === 'pendente' ? 'Pendente' :
                                     'Resolvido'}
                                  </Badge>
                                  <Badge className={
                                    ticket.prioridade === 'alta' ? 'bg-red-500' :
                                    ticket.prioridade === 'média' ? 'bg-amber-500' :
                                    'bg-slate-500'
                                  }>
                                    {ticket.prioridade}
                                  </Badge>
                                </div>
                                <h3 className="text-base font-medium mt-1">
                                  {ticket.assunto}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                  <span>{ticket.data}</span>
                                  <span>•</span>
                                  <span>{ticket.categoria}</span>
                                  <span>•</span>
                                  <span>{ticket.respostas.length} resposta(s)</span>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Nenhum chamado encontrado</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          Não encontramos chamados com os filtros selecionados
                        </p>
                        <Button onClick={() => {
                          setFiltroBusca('');
                          setFiltroStatus('todos');
                        }}>
                          Limpar filtros
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              // Detalhes do ticket selecionado
              <Card>
                <CardHeader className="p-4 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 p-2"
                          onClick={() => setTicketSelecionado(null)}
                        >
                          <ChevronRight className="h-4 w-4 rotate-180" />
                        </Button>
                        <CardTitle>
                          {ticketAtual?.id}: {ticketAtual?.assunto}
                        </CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={
                          ticketAtual?.status === 'aberto' ? 'bg-blue-500' :
                          ticketAtual?.status === 'pendente' ? 'bg-amber-500' :
                          'bg-green-500'
                        }>
                          {ticketAtual?.status === 'aberto' ? 'Aberto' :
                           ticketAtual?.status === 'pendente' ? 'Pendente' :
                           'Resolvido'}
                        </Badge>
                        <Badge className={
                          ticketAtual?.prioridade === 'alta' ? 'bg-red-500' :
                          ticketAtual?.prioridade === 'média' ? 'bg-amber-500' :
                          'bg-slate-500'
                        }>
                          {ticketAtual?.prioridade}
                        </Badge>
                        <Badge variant="outline">
                          {ticketAtual?.categoria}
                        </Badge>
                        <Badge variant="outline">
                          {ticketAtual?.data}
                        </Badge>
                      </div>
                    </div>
                    
                    {ticketAtual?.status !== 'resolvido' && (
                      <Button 
                        variant="outline" 
                        disabled={ticketAtual?.status === 'resolvido'}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Marcar como resolvido
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="space-y-6">
                    {/* Descrição inicial */}
                    <div className="bg-muted/40 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Descrição</h3>
                      <p className="text-sm">{ticketAtual?.descricao}</p>
                    </div>
                    
                    {/* Histórico de mensagens */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Histórico</h3>
                      
                      {ticketAtual?.respostas.map((resp, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg ${
                            resp.autor === 'Você' 
                              ? 'bg-primary text-primary-foreground ml-8' 
                              : 'bg-muted mr-8'
                          }`}
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">
                              {resp.autor}
                            </span>
                            <span className="text-xs opacity-70">
                              {resp.data}
                            </span>
                          </div>
                          <p className="text-sm">{resp.mensagem}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                {ticketAtual?.status !== 'resolvido' && (
                  <CardFooter className="p-4 border-t flex gap-2">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      className="min-h-[80px]"
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                    />
                    <Button className="self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
          </TabsContent>
          
          {/* Conteúdo da aba "Perguntas Frequentes" */}
          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
                <CardDescription>
                  Respostas para as dúvidas mais comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar perguntas..."
                    className="pl-8"
                  />
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {faq.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.pergunta}
                      </AccordionTrigger>
                      <AccordionContent>
                        {item.resposta}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 border-t p-4">
                <h3 className="text-sm font-medium">Não encontrou o que procura?</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Se você não encontrou a resposta para sua dúvida, abra um chamado para nossa equipe de suporte.
                </p>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Chamado
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Conteúdo da aba "Contatos" */}
          <TabsContent value="contato" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Telefone</h3>
                  <p className="text-muted-foreground mb-4">
                    Atendimento de segunda a sexta, das 9h às 18h
                  </p>
                  <div className="space-y-1">
                    <p className="font-medium">(11) 3456-7890</p>
                    <p className="text-sm">Atendimento Geral</p>
                    
                    <p className="font-medium mt-2">(11) 99876-5432</p>
                    <p className="text-sm">Emergências 24h</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">E-mail</h3>
                  <p className="text-muted-foreground mb-4">
                    Retorno em até 48 horas úteis
                  </p>
                  <div className="space-y-1">
                    <p className="font-medium">suporte@pauloimoveis.com.br</p>
                    <p className="text-sm">Suporte ao Cliente</p>
                    
                    <p className="font-medium mt-2">financeiro@pauloimoveis.com.br</p>
                    <p className="text-sm">Questões Financeiras</p>
                    
                    <p className="font-medium mt-2">manutencao@pauloimoveis.com.br</p>
                    <p className="text-sm">Problemas Técnicos e Reparos</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Chat</h3>
                  <p className="text-muted-foreground mb-4">
                    Atendimento em tempo real
                  </p>
                  <div className="space-y-4">
                    <p className="text-sm">
                      Nosso chat está disponível de segunda a sexta, das 9h às 18h, com atendentes especializados para resolver suas dúvidas.
                    </p>
                    <Button>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Iniciar Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Escritórios</CardTitle>
                <CardDescription>
                  Locais para atendimento presencial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">São Paulo - Matriz</h3>
                    <p className="text-sm mb-1">
                      Av. Paulista, 1000, 10º andar
                    </p>
                    <p className="text-sm mb-1">
                      Bela Vista, São Paulo - SP
                    </p>
                    <p className="text-sm mb-3">
                      CEP: 01310-100
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Horário: Segunda a sexta, das 9h às 18h
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">São Paulo - Zona Oeste</h3>
                    <p className="text-sm mb-1">
                      Rua dos Pinheiros, 500, Sala 302
                    </p>
                    <p className="text-sm mb-1">
                      Pinheiros, São Paulo - SP
                    </p>
                    <p className="text-sm mb-3">
                      CEP: 05422-010
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Horário: Segunda a sexta, das 9h às 18h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
