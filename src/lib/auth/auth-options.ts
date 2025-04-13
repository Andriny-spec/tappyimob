import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciais incompletas');
        }

        try {
          // Buscar usuário no banco de dados
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              admin: true,
              imobiliaria: true,
              corretor: true,
              cliente: true
            }
          });

          if (!user) {
            throw new Error('Usuário não encontrado');
          }

          // Verificar senha
          const passwordMatch = await bcrypt.compare(credentials.password, user.senha);
          if (!passwordMatch) {
            throw new Error('Senha incorreta');
          }

          // Retornar dados do usuário
          return {
            id: user.id,
            name: user.nome,
            email: user.email,
            role: user.role,
            status: user.status
          };
        } catch (error: any) {
          console.error('Erro ao autenticar:', error);
          throw new Error(error.message || 'Erro ao autenticar');
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'seu-secret-provisorio',
};
