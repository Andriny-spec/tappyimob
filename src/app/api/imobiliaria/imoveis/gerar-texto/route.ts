import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { tipo, detalhes } = body;

    if (!tipo || !detalhes) {
      return NextResponse.json({ error: 'Tipo e detalhes são obrigatórios' }, { status: 400 });
    }

    // Montar o prompt para o modelo de IA
    let prompt = '';

    if (tipo === 'titulo') {
      prompt = `Crie um título atraente para um anúncio de imóvel com as seguintes características:
      - Tipo: ${detalhes.tipoImovel || 'Não especificado'}
      - Localização: ${detalhes.bairro || ''}, ${detalhes.cidade || ''}, ${detalhes.estado || ''}
      - Quartos: ${detalhes.quartos || 'Não especificado'}
      - Suítes: ${detalhes.suites || 'Não especificado'}
      - Área: ${detalhes.areaTotal || 'Não especificada'} m²
      
      O título deve ser conciso (máximo 60 caracteres), atraente, destacar os diferenciais do imóvel e seguir o padrão do mercado imobiliário brasileiro.`;
    } else if (tipo === 'descricao') {
      prompt = `Crie uma descrição completa e atraente para um anúncio de imóvel com as seguintes características:
      - Tipo: ${detalhes.tipoImovel || 'Não especificado'}
      - Operação: ${detalhes.tipoOperacao || 'Não especificado'}
      - Localização: ${detalhes.endereco || ''}, ${detalhes.bairro || ''}, ${detalhes.cidade || ''}, ${detalhes.estado || ''}
      - Valor: R$ ${detalhes.valor?.toLocaleString('pt-BR') || 'Não especificado'}
      - Quartos: ${detalhes.quartos || 'Não especificado'}
      - Suítes: ${detalhes.suites || 'Não especificado'}
      - Banheiros: ${detalhes.banheiros || 'Não especificado'}
      - Salas: ${detalhes.salas || 'Não especificado'}
      - Cozinhas: ${detalhes.cozinhas || 'Não especificado'}
      - Vagas de garagem: ${detalhes.vagas || 'Não especificado'}
      - Área total: ${detalhes.areaTotal || 'Não especificada'} m²
      - Área construída: ${detalhes.areaConstruida || 'Não especificada'} m²
      - Adicionais: ${detalhes.adicionais?.join(', ') || 'Não especificado'}
      
      A descrição deve ser detalhada (300-500 palavras), atraente, destacar os diferenciais do imóvel, mencionar a localização e proximidades, e seguir o padrão do mercado imobiliário brasileiro. Use linguagem persuasiva mas profissional.`;
    } else {
      return NextResponse.json({ error: 'Tipo de geração inválido' }, { status: 400 });
    }
    
    // Simulação da resposta da IA (em ambiente real, aqui faria a chamada para a API de IA)
    let resposta = '';
    
    if (tipo === 'titulo') {
      const tipoFormatado = detalhes.tipoImovel?.toString().toLowerCase().replace('_', ' ') || '';
      const localizacao = detalhes.bairro ? `no ${detalhes.bairro}` : detalhes.cidade ? `em ${detalhes.cidade}` : '';
      
      const opcoesTitulos = [
        `Exclusivo ${tipoFormatado} ${localizacao} com ${detalhes.quartos} quartos`,
        `${tipoFormatado.charAt(0).toUpperCase() + tipoFormatado.slice(1)} amplo ${localizacao} com ${detalhes.quartos} dormitórios`,
        `Lindo ${tipoFormatado} de ${detalhes.areaTotal}m² ${localizacao}`,
        `${tipoFormatado.charAt(0).toUpperCase() + tipoFormatado.slice(1)} moderno ${localizacao} com ${detalhes.quartos} quartos`,
        `${tipoFormatado.charAt(0).toUpperCase() + tipoFormatado.slice(1)} sofisticado com ${detalhes.suites} suítes ${localizacao}`
      ];
      
      resposta = opcoesTitulos[Math.floor(Math.random() * opcoesTitulos.length)];
    } else {
      // Descrição
      const tipoFormatado = detalhes.tipoImovel?.toString().toLowerCase().replace('_', ' ') || '';
      const operacao = detalhes.tipoOperacao === 'VENDA' ? 'à venda' : detalhes.tipoOperacao === 'ALUGUEL' ? 'para alugar' : 'disponível';
      const localizacao = `${detalhes.bairro || ''}, ${detalhes.cidade || ''}, ${detalhes.estado || ''}`.replace(/, ,/g, ',').replace(/^,|,$/g, '');
      
      const descricaoIntro = `Apresentamos este maravilhoso ${tipoFormatado} ${operacao} em ${localizacao}. Com ${detalhes.areaTotal || '--'}m² de área total e ${detalhes.areaConstruida || '--'}m² de área construída, esta propriedade oferece conforto e sofisticação para você e sua família.`;
      
      const descricaoCaracteristicas = `O imóvel conta com ${detalhes.quartos || '--'} dormitórios, sendo ${detalhes.suites || '--'} suítes, ${detalhes.banheiros || '--'} banheiros, ${detalhes.salas || '--'} sala(s) e ${detalhes.cozinhas || '--'} cozinha(s). Dispõe ainda de ${detalhes.vagas || '--'} vaga(s) de garagem, garantindo praticidade no seu dia a dia.`;
      
      let descricaoAdicionais = '';
      if (detalhes.adicionais && detalhes.adicionais.length > 0) {
        descricaoAdicionais = `Como diferenciais, a propriedade oferece: ${detalhes.adicionais.join(', ')}.`;
      }
      
      const descricaoLocalizacao = `Localizado em região privilegiada, o imóvel proporciona fácil acesso a comércios, escolas, parques e todas as facilidades que a região tem a oferecer.`;
      
      const descricaoFinal = `Não perca a oportunidade de conhecer este incrível ${tipoFormatado}. Agende uma visita e surpreenda-se com todos os detalhes e o conforto que este imóvel pode proporcionar para você e sua família.`;
      
      resposta = `${descricaoIntro}\n\n${descricaoCaracteristicas}\n\n${descricaoAdicionais}\n\n${descricaoLocalizacao}\n\n${descricaoFinal}`;
    }

    // Retornar o resultado
    return NextResponse.json({
      [tipo]: resposta
    });
  } catch (error) {
    console.error('Erro ao gerar texto com IA:', error);
    return NextResponse.json({ error: 'Erro ao processar a requisição' }, { status: 500 });
  }
}
