import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * API de proxy para o checkout do Tappy.id
 * Evita problemas de CORS que podem ocorrer em localhost
 */
export async function POST(request: NextRequest) {
  try {
    // Log para debug
    console.log('Recebendo requisição no endpoint de checkout');
    
    // Extrair dados do corpo da requisição
    const data = await request.json().catch(error => {
      console.error('Erro ao processar o JSON da requisição:', error);
      return {};
    });
    
    console.log('Dados recebidos na requisição:', data);
    
    // Validar dados
    if (!data.email || !data.name || !data.phone || !data.planId) {
      console.log('Dados incompletos na requisição');
      return NextResponse.json(
        { success: false, message: 'Dados incompletos.' },
        { status: 400 }
      );
    }
    
    // URL do site principal
    const url = 'https://tappy.id/api/assinatura/checkout';
    console.log('Enviando requisição para:', url);
    
    // Enviar requisição para o servidor Tappy.id
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TappyImob/1.0.0'
      },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
        phone: data.phone,
        planId: data.planId,
        type: 'IMOBILIARIA',
        origin: 'tappyimob-site'
      }),
      cache: 'no-store'
    });
    
    console.log('Resposta do servidor:', res.status, res.statusText);
    
    // Verificar se a resposta está OK
    if (!res.ok) {
      const errorText = await res.text();
      let errorMsg = `Erro no servidor: ${res.status}`;
      
      console.log('Texto da resposta de erro:', errorText);
      
      try {
        if (errorText) {
          const jsonError = JSON.parse(errorText);
          errorMsg = jsonError.error || jsonError.message || errorMsg;
        }
      } catch (jsonError) {
        console.error('Erro ao processar resposta de erro:', jsonError);
      }
      
      return NextResponse.json(
        { success: false, message: errorMsg },
        { status: res.status }
      );
    }
    
    // Processar resposta
    type ResponseData = {
      url?: string;
      kirvanoUrl?: string;
      [key: string]: any;
    };
    
    let responseData: ResponseData = {};
    try {
      const responseText = await res.text();
      console.log('Resposta em texto:', responseText);
      
      if (responseText) {
        responseData = JSON.parse(responseText) as ResponseData;
        console.log('Resposta em JSON:', responseData);
      }
    } catch (jsonError) {
      console.error('Erro ao processar resposta JSON:', jsonError);
      return NextResponse.json(
        { success: false, message: 'Erro ao processar resposta do servidor' },
        { status: 500 }
      );
    }
    
    // Retornar sucesso
    const successResponse = {
      success: true,
      message: 'Imobiliária cadastrada com sucesso! Uma senha foi enviada para seu email.',
      kirvanoUrl: responseData.url || responseData.kirvanoUrl || 'https://tappy.id/checkout/success',
    };
    
    console.log('Enviando resposta de sucesso:', successResponse);
    
    return NextResponse.json(successResponse);
    
  } catch (error) {
    console.error('Erro no proxy de checkout:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
