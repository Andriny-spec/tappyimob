import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Enum para status de leads (uma cópia do que está no prisma schema)
enum StatusLead {
  NOVO = 'NOVO',
  CONTATO = 'CONTATO',
  INTERESSADO = 'INTERESSADO',
  VISITA = 'VISITA',
  PROPOSTA = 'PROPOSTA',
  CONTRATO = 'CONTRATO',
  FECHADO = 'FECHADO',
  PERDIDO = 'PERDIDO',
}

enum TipoLead {
  COMPRADOR = 'COMPRADOR',
  VENDEDOR = 'VENDEDOR',
  LOCATARIO = 'LOCATARIO',
  LOCADOR = 'LOCADOR',
  INVESTIDOR = 'INVESTIDOR',
}

enum OrigemLead {
  SITE = 'SITE',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  INDICACAO = 'INDICACAO',
  PORTAL_IMOVEIS = 'PORTAL_IMOVEIS',
  LIGACAO = 'LIGACAO',
  ANUNCIO = 'ANUNCIO',
  VISITA_ESCRITORIO = 'VISITA_ESCRITORIO',
  OUTROS = 'OUTROS',
}

// Interface para os dados do cliente
interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  fotoPerfil?: string;
  
  // Campos CRM
  statusLead?: StatusLead;
  tipoLead?: TipoLead;
  origemLead?: OrigemLead;
  interesse?: string;
  orcamento?: number;
  prazo?: Date;
  observacoes?: string;
  temperatura?: number;
  ultimoContato?: Date;
  proximoContato?: Date;
  corretorResponsavelId?: string;
  corretorResponsavel?: string;
  
  // Métricas
  visualizacoes: number;
  mensagensRecebidas: number;
  visualizacoesImoveis: number;
  agendamentosRealizados: number;
  
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Função para gerar dados aleatórios de clientes/leads
function gerarClientes(quantidade: number = 10): Cliente[] {
  const tiposImoveis = [
    'Apartamento 2 quartos no centro',
    'Casa 3 quartos em condomínio',
    'Sala comercial em região central',
    'Lote em condomínio fechado',
    'Apartamento 4 quartos no bairro nobre',
    'Cobertura duplex com vista para o mar',
    'Ponto comercial no shopping',
    'Fazenda produtiva de 50 hectares',
    'Chácara com lago e área de lazer',
    'Loja em rua de alto fluxo'
  ];
  
  const bairros = [
    'Centro', 'Jardim América', 'Buritis', 'Savassi', 'Funcionários', 
    'Lourdes', 'Bela Vista', 'Santa Efigênia', 'Sion', 'Belvedere'
  ];
  
  const cidades = ['Belo Horizonte', 'São Paulo', 'Rio de Janeiro', 'Curitiba', 'Brasília'];
  const estados = ['MG', 'SP', 'RJ', 'PR', 'DF'];
  
  const nomes = [
    'Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Pereira', 'Patricia Lima', 
    'Roberto Costa', 'Amanda Souza', 'Fernando Almeida', 'Juliana Ferreira', 'Lucas Martins',
    'Mariana Rodrigues', 'Bruno Gomes', 'Gabriela Ribeiro', 'Daniel Carvalho', 'Camila Barbosa',
    'Rafael Nascimento', 'Fernanda Lopes', 'Gustavo Alves', 'Letícia Vieira', 'Thiago Cardoso'
  ];
  
  const corretores = ['Leonardo Ferreira', 'Mariana Santos', 'Ricardo Oliveira', 'Carolina Costa', 'Fábio Mendes'];
  
  const clientes: Cliente[] = [];
  
  for (let i = 0; i < quantidade; i++) {
    const nome = nomes[Math.floor(Math.random() * nomes.length)];
    const email = nome.toLowerCase().replace(' ', '.') + '@email.com';
    const telefone = `(${Math.floor(Math.random() * 90) + 10}) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
    const bairro = bairros[Math.floor(Math.random() * bairros.length)];
    const cidade = cidades[Math.floor(Math.random() * cidades.length)];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    const interesse = tiposImoveis[Math.floor(Math.random() * tiposImoveis.length)];
    const orcamento = Math.floor(Math.random() * 900000) + 100000;
    const temperatura = Math.floor(Math.random() * 5) + 1;
    
    // Distribuir clientes nas etapas do funil
    const statusOptions = [StatusLead.NOVO, StatusLead.CONTATO, StatusLead.INTERESSADO, StatusLead.VISITA];
    const statusLead = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    // Gerar tipo de lead aleatório
    const tipoOptions = [TipoLead.COMPRADOR, TipoLead.VENDEDOR, TipoLead.LOCATARIO, TipoLead.LOCADOR, TipoLead.INVESTIDOR];
    const tipoLead = tipoOptions[Math.floor(Math.random() * tipoOptions.length)];
    
    // Gerar origem de lead aleatória
    const origemOptions = [
      OrigemLead.SITE, OrigemLead.SOCIAL_MEDIA, OrigemLead.INDICACAO, 
      OrigemLead.PORTAL_IMOVEIS, OrigemLead.LIGACAO, OrigemLead.ANUNCIO,
      OrigemLead.VISITA_ESCRITORIO, OrigemLead.OUTROS
    ];
    const origemLead = origemOptions[Math.floor(Math.random() * origemOptions.length)];
    
    // Gerar datas aleatórias no passado recente
    const dataAtual = new Date();
    const ultimoContato = new Date(dataAtual);
    ultimoContato.setDate(dataAtual.getDate() - Math.floor(Math.random() * 30));
    
    const proximoContato = new Date(dataAtual);
    proximoContato.setDate(dataAtual.getDate() + Math.floor(Math.random() * 14) + 1);
    
    const createdAt = new Date(dataAtual);
    createdAt.setDate(dataAtual.getDate() - Math.floor(Math.random() * 90));
    
    const updatedAt = new Date(createdAt);
    updatedAt.setDate(createdAt.getDate() + Math.floor(Math.random() * (dataAtual.getDate() - createdAt.getDate())));
    
    // Gerar corretores aleatórios
    const corretorResponsavel = corretores[Math.floor(Math.random() * corretores.length)];
    
    // Gerar métricas aleatórias
    const visualizacoes = Math.floor(Math.random() * 50);
    const mensagensRecebidas = Math.floor(Math.random() * 20);
    const visualizacoesImoveis = Math.floor(Math.random() * 30);
    const agendamentosRealizados = Math.floor(Math.random() * 5);
    
    clientes.push({
      id: uuidv4(),
      nome,
      email,
      telefone,
      endereco: `Rua das Flores, ${Math.floor(Math.random() * 1000)}`,
      bairro,
      cidade,
      estado,
      fotoPerfil: undefined,
      statusLead,
      tipoLead,
      origemLead,
      interesse,
      orcamento,
      temperatura,
      prazo: new Date(dataAtual.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      observacoes: `Cliente interessado em ${interesse} na região de ${bairro}.`,
      ultimoContato,
      proximoContato,
      corretorResponsavelId: undefined,
      corretorResponsavel,
      visualizacoes,
      mensagensRecebidas,
      visualizacoesImoveis,
      agendamentosRealizados,
      createdAt,
      updatedAt
    });
  }
  
  return clientes;
}

// Rota para obter a lista de clientes
export async function GET(request: Request) {
  try {
    const clientes = gerarClientes(20);
    
    return NextResponse.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    console.error('Erro ao gerar clientes:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao gerar clientes'
    }, { status: 500 });
  }
}

// Rota para salvar a ordem dos cards
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Aqui você salvaria a ordem no banco de dados
    // Em um ambiente real, você faria algo como:
    // await prisma.kanbanOrder.upsert({
    //   where: { userId: data.userId },
    //   update: { orderData: data.order },
    //   create: { userId: data.userId, orderData: data.order }
    // });
    
    console.log('Ordem dos cards recebida para salvar:', data.order);
    
    return NextResponse.json({
      success: true,
      message: 'Ordem dos cards salva com sucesso'
    });
  } catch (error) {
    console.error('Erro ao salvar ordem dos cards:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao salvar ordem dos cards'
    }, { status: 500 });
  }
}
