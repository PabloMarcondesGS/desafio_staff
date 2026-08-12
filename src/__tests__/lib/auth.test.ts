import {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  extractTokenFromHeader,
} from '@/lib/auth';
import { UserSession } from '@/lib/types';

describe('🔒 Módulo de Autenticação e Criptografia (src/lib/auth.ts)', () => {
  describe('hashPassword e comparePassword', () => {
    it('deve gerar um hash bcrypt válido diferente da senha em texto plano', async () => {
      const plainPassword = 'senhaSegura123!';
      const hash = await hashPassword(plainPassword);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith('$2')).toBe(true);
    });

    it('deve retornar true ao comparar a senha correta com o hash', async () => {
      const plainPassword = 'adminPassword2026';
      const hash = await hashPassword(plainPassword);
      const isMatch = await comparePassword(plainPassword, hash);

      expect(isMatch).toBe(true);
    });

    it('deve retornar false ao comparar uma senha incorreta', async () => {
      const plainPassword = 'minhaSenhaCorreta';
      const hash = await hashPassword(plainPassword);
      const isMatch = await comparePassword('senhaErrada123', hash);

      expect(isMatch).toBe(false);
    });
  });

  describe('signToken e verifyToken', () => {
    const mockUser: UserSession = {
      id: 'usr-12345',
      name: 'João Inspetor',
      email: 'joao@fixcar.com',
      role: 'INSPETOR',
    };

    it('deve assinar um token JWT válido contendo os dados da sessão', () => {
      const token = signToken(mockUser);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // Cabeçalho.Payload.Assinatura
    });

    it('deve verificar e decodificar com sucesso um token JWT válido', () => {
      const token = signToken(mockUser);
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.id).toBe(mockUser.id);
      expect(decoded?.name).toBe(mockUser.name);
      expect(decoded?.email).toBe(mockUser.email);
      expect(decoded?.role).toBe(mockUser.role);
    });

    it('deve retornar null ao verificar um token adulterado ou inválido', () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload';
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('deve retornar null para string vazia ou token inexistente', () => {
      expect(verifyToken('')).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('deve extrair o token corretamente de um cabeçalho Bearer válido', () => {
      const authHeader = 'Bearer meuTokenJwtSuperSeguro123';
      const extracted = extractTokenFromHeader(authHeader);

      expect(extracted).toBe('meuTokenJwtSuperSeguro123');
    });

    it('deve retornar null se o cabeçalho não começar com "Bearer "', () => {
      expect(extractTokenFromHeader('Basic dXNlcjpwYXNz')).toBeNull();
      expect(extractTokenFromHeader('tokenDiretoSemBearer')).toBeNull();
    });

    it('deve retornar null se o cabeçalho for nulo, indefinido ou vazio', () => {
      expect(extractTokenFromHeader(null)).toBeNull();
      expect(extractTokenFromHeader(undefined)).toBeNull();
      expect(extractTokenFromHeader('')).toBeNull();
    });
  });
});
