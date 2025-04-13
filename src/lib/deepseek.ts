import { OpenAI } from 'openai';

// Configuração do cliente OpenAI para usar com DeepSeek
// O DeepSeek é compatível com a API do OpenAI
const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1', // URL base da API DeepSeek
});

export default deepseekClient;
