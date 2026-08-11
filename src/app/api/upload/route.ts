/**
 * 🔒 ROTA PROTEGIDA POR TOKEN JWT: POST /api/upload
 * Processa upload de imagens de evidências fotográficas e assinaturas digitais multipart/formData ou base64.
 * Salva localmente em /public/uploads e retorna a URL pública do arquivo. (Acesso: ADMIN, GESTOR, INSPETOR).
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // 1. Validação do Token JWT no Header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const base64Data = formData.get('base64') as string | null;

    // 2. Garante a existência do diretório /public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);

    // 3. Processamento de arquivo binário direto (Multipart)
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || '.jpg';
      const fileName = `inspection_${timestamp}_${randomSuffix}${ext}`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({
        url: `/uploads/${fileName}`,
        fileName: file.name,
        size: file.size,
      });
    }
    // 4. Processamento de imagem em Base64 (ex: Assinatura do SignaturePad)
    else if (base64Data) {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: 'Formato base64 inválido' }, { status: 400 });
      }
      const buffer = Buffer.from(matches[2], 'base64');
      const fileName = `photo_${timestamp}_${randomSuffix}.png`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({
        url: `/uploads/${fileName}`,
        fileName,
      });
    }

    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro no upload de foto:', error);
    return NextResponse.json({ error: 'Erro ao processar upload de arquivo' }, { status: 500 });
  }
}
