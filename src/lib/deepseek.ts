import { OpenAI } from 'openai';

// Verificar se a chave API está definida
if (!process.env.DEEPSEEK_API_KEY) {
  console.error('A chave DEEPSEEK_API_KEY não está definida nas variáveis de ambiente');
}

// Configuração do cliente OpenAI para usar com DeepSeek
// O DeepSeek é compatível com a API do OpenAI
const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-02016030362646aba6a6ff800d94d7fb', // Usa a variável de ambiente ou uma chave de fallback
  baseURL: 'https://api.deepseek.com/v1', // URL base da API DeepSeek
  timeout: 30000, // Aumenta o timeout para 30 segundos
});

export default deepseekClient;
