import { createHash } from 'crypto';

/**
 * Calcula o hash de uma senha usando SHA-256
 * @param password Senha a ser hasheada
 * @returns Hash da senha
 */
export async function calculateHash(password: string): Promise<string> {
  return createHash('sha256').update(password).digest('hex');
}
