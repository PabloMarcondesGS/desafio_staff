/**
 * 🛡️ MÓDULO DE AUTENTICAÇÃO E CRIPTOGRAFIA (JWT & BCRYPT)
 * Contém as funções centrais para hash de senhas, validação de credenciais e ciclo de vida de tokens JWT.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserSession } from './types';

// Segredo JWT e tempo de expiração configurado para 1 hora
const JWT_SECRET = process.env.JWT_SECRET || 'desafio-staff-secret-key-super-secure-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * 🔒 Gera o hash seguro da senha usando bcrypt com 10 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * 🔑 Compara uma senha em texto plano com o hash bcrypt gravado no banco de dados.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * 🎟️ Assina um novo token JWT contendo a sessão do usuário com validade de 1 hora.
 */
export function signToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

/**
 * 🔍 Verifica e decodifica um token JWT. Retorna os dados do usuário ou null se for inválido/expirado.
 */
export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}

/**
 * 📤 Extrai o token JWT limpo a partir do cabeçalho HTTP 'Authorization: Bearer <token>'.
 */
export function extractTokenFromHeader(authHeader?: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
