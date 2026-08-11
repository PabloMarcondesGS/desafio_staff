/**
 * 🔑 ROTA PÚBLICA DE AUTENTICAÇÃO: POST /api/auth/login
 * Realiza a validação de credenciais de e-mail e senha com hash bcrypt e gera o token JWT assinado (validade de 1 hora).
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // 1. Extrai credenciais enviadas no corpo da requisição
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // 2. Busca o usuário ativo no banco de dados pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'Credenciais inválidas ou usuário inativo' },
        { status: 401 }
      );
    }

    // 3. Compara a senha informada com o hash bcrypt armazenado
    const passwordMatches = await comparePassword(password, user.password_hash);
    if (!passwordMatches) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // 4. Monta a sessão do usuário com perfil de acesso (RBAC)
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
    };

    // 5. Gera o token JWT com payload da sessão
    const token = signToken(sessionUser);

    return NextResponse.json({
      user: sessionUser,
      token,
    });
  } catch (error: any) {
    console.error('Erro na rota de login:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar login' },
      { status: 500 }
    );
  }
}
