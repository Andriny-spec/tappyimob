/**
 * Serviço para integração com a API do Leonardo AI
 */

// Token da API do Leonardo
const LEONARDO_API_TOKEN = process.env.LEONARDO_AI_TOKEN;
const LEONARDO_API_URL = 'https://cloud.leonardo.ai/api/rest/v1';

interface GenerateImageOptions {
  prompt: string;
  negative_prompt?: string;
  model_id?: string;
  width?: number;
  height?: number;
  num_images?: number;
}

interface GenerationResponse {
  generationId: string;
  status: string;
}

interface GeneratedImage {
  url: string;
  id: string;
}

/**
 * Gera uma imagem com a API do Leonardo AI
 */
export async function generateImage(options: GenerateImageOptions): Promise<GenerationResponse> {
  if (!LEONARDO_API_TOKEN) {
    throw new Error('Token de API do Leonardo não configurado');
  }

  const defaultOptions = {
    model_id: 'e316348f-7773-490e-adcd-46757c738eb7', // Modelo "Absolute Reality v1.8.1"
    width: 512,
    height: 512,
    num_images: 1,
    negative_prompt: 'deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, low quality'
  };

  const payload = {
    ...defaultOptions,
    ...options,
  };

  try {
    const response = await fetch(`${LEONARDO_API_URL}/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LEONARDO_API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao gerar imagem: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      generationId: data.sdGenerationJob.generationId,
      status: data.sdGenerationJob.status
    };
  } catch (error) {
    console.error('Erro ao chamar API do Leonardo:', error);
    throw error;
  }
}

/**
 * Verifica o status de uma geração de imagem
 */
export async function checkGenerationStatus(generationId: string): Promise<{
  status: string;
  images: GeneratedImage[];
}> {
  if (!LEONARDO_API_TOKEN) {
    throw new Error('Token de API do Leonardo não configurado');
  }

  try {
    const response = await fetch(`${LEONARDO_API_URL}/generations/${generationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LEONARDO_API_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao verificar status: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Extrair URLs e IDs das imagens geradas
    const images = (data.generations_by_pk?.generated_images || []).map((img: any) => ({
      url: img.url,
      id: img.id
    }));

    return {
      status: data.generations_by_pk?.status || 'unknown',
      images
    };
  } catch (error) {
    console.error('Erro ao verificar status da geração:', error);
    throw error;
  }
}

/**
 * Gera um prompt para criação de logo com base nos parâmetros fornecidos
 */
export function generateLogoPrompt(options: {
  nomeSite: string;
  tipo: string;
  estilo: string;
  cor: string;
}): string {
  const { nomeSite, tipo, estilo, cor } = options;
  
  const basePrompt = `Logo minimalista e profissional para uma imobiliária chamada "${nomeSite}", `;
  
  const tipoDesc = tipo === 'simbolo' 
    ? 'usando apenas um símbolo ou ícone abstrato, sem texto, fundo branco, alta qualidade' 
    : 'com o nome da empresa em tipografia elegante, fundo branco, alta qualidade';
  
  const estiloDesc = estilo === 'moderno' 
    ? 'estilo moderno e clean' 
    : estilo === 'luxo' 
      ? 'aparência premium e sofisticada' 
      : 'design corporativo profissional';
  
  const corDesc = cor ? `predominantemente na cor ${cor}` : '';
  
  return `${basePrompt} ${tipoDesc}, ${estiloDesc}, ${corDesc}, formato vetorial, 8k, sem texto adicional, sem bordas.`;
}
