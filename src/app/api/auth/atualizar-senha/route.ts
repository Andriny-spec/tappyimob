import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcrypt';

// POST /api/auth/atualizar-senha - Atualizar a senha do usuário logado
export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { senhaAtual, novaSenha } = await request.json();

    // Validações básicas
    if (!senhaAtual || !novaSenha) {
      return NextResponse.json({ error: "Senhas não fornecidas" }, { status: 400 });
    }

    if (novaSenha.length < 6) {
      return NextResponse.json({ error: "A nova senha deve ter pelo menos 6 caracteres" }, { status: 400 });
    }

    // Buscar usuário com a senha atual
    const usuario = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        senha: true
      }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se a senha atual está correta
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaCorreta) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
    }

    // Gerar hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(novaSenha, salt);

    // Atualizar senha no banco de dados
    await prisma.user.update({
      where: { id: session.user.id },
      data: { senha: hashSenha }
    });

    return NextResponse.json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
