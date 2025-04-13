import { PrismaClient, Role, StatusUser } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Criar um administrador
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@tappyimob.com' },
      update: {},
      create: {
        nome: 'Administrador',
        email: 'admin@tappyimob.com',
        senha: adminPassword,
        role: Role.ADMIN,
        status: StatusUser.ATIVO,
        admin: {
          create: {}
        }
      }
    });
    console.log('Administrador criado:', admin.email);

    // Criar uma imobiliária
    const imobiliariaPassword = await bcrypt.hash('imobiliaria123', 10);
    const imobiliaria = await prisma.user.upsert({
      where: { email: 'imobiliaria@exemplo.com' },
      update: {},
      create: {
        nome: 'Imobiliária Exemplo',
        email: 'imobiliaria@exemplo.com',
        senha: imobiliariaPassword,
        role: Role.IMOBILIARIA,
        status: StatusUser.ATIVO,
        imobiliaria: {
          create: {
            telefone: '(11) 99999-9999',
            endereco: 'Av. Paulista',
            bairro: 'Bela Vista',
            numero: '1000',
            cidade: 'São Paulo',
            estado: 'SP',
            cnpj: '12.345.678/0001-99'
          }
        }
      }
    });
    console.log('Imobiliária criada:', imobiliaria.email);

    // Criar um corretor
    const corretorPassword = await bcrypt.hash('corretor123', 10);
    const corretor = await prisma.user.upsert({
      where: { email: 'corretor@exemplo.com' },
      update: {},
      create: {
        nome: 'João Corretor',
        email: 'corretor@exemplo.com',
        senha: corretorPassword,
        role: Role.CORRETOR,
        status: StatusUser.ATIVO,
        corretor: {
          create: {
            telefone: '(11) 88888-8888',
            endereco: 'Rua Augusta',
            bairro: 'Consolação',
            numero: '500',
            cidade: 'São Paulo',
            estado: 'SP',
            cpf: '123.456.789-00',
            creci: 'CRECI-12345',
            imobiliariaId: undefined // Será definido após a execução
          }
        }
      }
    });
    console.log('Corretor criado:', corretor.email);

    // Relacionar o corretor com a imobiliária
    await prisma.corretor.update({
      where: { id: corretor.id },
      data: {
        imobiliaria: {
          connect: { id: imobiliaria.id }
        }
      }
    });
    console.log('Corretor vinculado à imobiliária');

    console.log('Seed concluído com sucesso.');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
