import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { generateImage, generateLogoPrompt, checkGenerationStatus } from '@/lib/leonardo-ai';

/**
 * Gera uma logo usando Leonardo AI
 */
export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Obter dados da requisição
    const { nomeSite, tipo, estilo, cor } = await request.json();
    
    // Validar campos obrigatórios
    if (!nomeSite) {
      return NextResponse.json({ 
        error: 'Nome do site é obrigatório para gerar uma logo' 
      }, { status: 400 });
    }
    
    // Gerar prompt para a logo
    const prompt = generateLogoPrompt({
      nomeSite,
      tipo: tipo || 'completo',
      estilo: estilo || 'moderno',
      cor: cor || 'azul'
    });
    
    // Chamar a API do Leonardo para gerar a imagem
    const generation = await generateImage({
      prompt,
      width: 512,
      height: 512,
      num_images: 2
    });
    
    return NextResponse.json({ 
      success: true,
      generationId: generation.generationId,
      status: generation.status,
      message: 'Solicitação de geração de logo enviada com sucesso'
    });
    
  } catch (error: any) {
    console.error('Erro ao gerar logo:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao gerar logo'
    }, { status: 500 });
  }
}

/**
 * Verifica o status de uma geração de logo
 */
export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Obter ID da geração da URL
    const url = new URL(request.url);
    const generationId = url.searchParams.get('generationId');
    
    if (!generationId) {
      return NextResponse.json({ 
        error: 'ID da geração é obrigatório' 
      }, { status: 400 });
    }
    
    // Verificar status da geração
    const result = await checkGenerationStatus(generationId);
    
    return NextResponse.json({ 
      success: true,
      status: result.status,
      images: result.images,
      complete: result.status === 'COMPLETE'
    });
    
  } catch (error: any) {
    console.error('Erro ao verificar status de geração:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao verificar status de geração'
    }, { status: 500 });
  }
}
