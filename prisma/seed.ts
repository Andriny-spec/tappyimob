import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Criar Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tappyimob.com.br" },
    update: {},
    create: {
      email: "admin@tappyimob.com.br",
      password: adminPassword,
      name: "Administrador",
      phone: "(11) 99999-9999",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("✅ Admin criado:", admin.email);

  // Criar Corretor
  const corretorPassword = await bcrypt.hash("corretor123", 10);
  const corretor = await prisma.user.upsert({
    where: { email: "corretor@tappyimob.com.br" },
    update: {},
    create: {
      email: "corretor@tappyimob.com.br",
      password: corretorPassword,
      name: "João Silva",
      phone: "(11) 98888-8888",
      role: "CORRETOR",
      creci: "123456-F",
      bio: "Corretor especializado em imóveis de alto padrão na região dos Jardins.",
      isActive: true,
    },
  });
  console.log("✅ Corretor criado:", corretor.email);

  // Criar Cliente
  const clientePassword = await bcrypt.hash("cliente123", 10);
  const cliente = await prisma.user.upsert({
    where: { email: "cliente@email.com" },
    update: {},
    create: {
      email: "cliente@email.com",
      password: clientePassword,
      name: "Maria Santos",
      phone: "(11) 97777-7777",
      role: "CLIENTE",
      isActive: true,
    },
  });
  console.log("✅ Cliente criado:", cliente.email);

  // Criar alguns imóveis de exemplo
  const imoveis = [
    {
      code: "IMB-2024-001",
      title: "Apartamento Alto Padrão com Vista Panorâmica",
      description: "Exclusivo apartamento no coração dos Jardins com acabamento de primeira linha. Vista deslumbrante para o skyline de São Paulo.",
      type: "APARTAMENTO" as const,
      status: "DISPONIVEL" as const,
      price: 1850000,
      pricePerM2: 18500,
      condoFee: 2500,
      iptu: 1200,
      area: 120,
      totalArea: 145,
      bedrooms: 3,
      suites: 1,
      bathrooms: 2,
      parkingSpaces: 2,
      floor: 15,
      position: "Nascente",
      yearBuilt: 2022,
      address: "Rua Oscar Freire",
      number: "1500",
      neighborhood: "Jardins",
      city: "São Paulo",
      state: "SP",
      zipCode: "01426-001",
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
      ],
      videos: [],
      amenities: ["Piscina", "Academia", "Salão de Festas", "Playground", "Churrasqueira"],
      ownerId: corretor.id,
    },
    {
      code: "IMB-2024-002",
      title: "Casa Moderna em Condomínio Fechado",
      description: "Casa contemporânea com projeto arquitetônico diferenciado. Amplos espaços e integração com a natureza.",
      type: "CASA" as const,
      status: "DISPONIVEL" as const,
      price: 3200000,
      pricePerM2: 12800,
      condoFee: 1800,
      iptu: 2500,
      area: 250,
      totalArea: 500,
      bedrooms: 4,
      suites: 2,
      bathrooms: 4,
      parkingSpaces: 4,
      yearBuilt: 2021,
      address: "Alameda dos Ipês",
      number: "100",
      neighborhood: "Sua Cidade",
      city: "Barueri",
      state: "SP",
      zipCode: "06453-000",
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800",
      ],
      videos: [],
      amenities: ["Piscina Privativa", "Jardim", "Área Gourmet", "Home Office", "Lareira"],
      ownerId: corretor.id,
    },
    {
      code: "IMB-2024-003",
      title: "Cobertura Duplex com Terraço",
      description: "Cobertura espetacular com vista 360° da cidade. Terraço amplo com piscina privativa e área gourmet completa.",
      type: "COBERTURA" as const,
      status: "DISPONIVEL" as const,
      price: 4500000,
      pricePerM2: 22500,
      condoFee: 4000,
      iptu: 3500,
      area: 200,
      totalArea: 280,
      bedrooms: 4,
      suites: 3,
      bathrooms: 5,
      parkingSpaces: 3,
      floor: 25,
      position: "Norte",
      yearBuilt: 2023,
      address: "Av. Brigadeiro Faria Lima",
      number: "3000",
      neighborhood: "Itaim Bibi",
      city: "São Paulo",
      state: "SP",
      zipCode: "04538-132",
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800",
      ],
      videos: [],
      amenities: ["Piscina no Terraço", "Jacuzzi", "Sauna", "Home Theater", "Adega"],
      ownerId: corretor.id,
    },
  ];

  for (const imovel of imoveis) {
    await prisma.property.upsert({
      where: { code: imovel.code },
      update: {},
      create: imovel,
    });
    console.log("✅ Imóvel criado:", imovel.code);
  }

  // Criar mais corretores
  const corretores = [
    { name: "Maria Silva", email: "maria@tappyimob.com.br", creci: "234567-F", region: "Zona Sul", rating: 4.8, totalSales: 45, totalValue: 12500000 },
    { name: "Ana Costa", email: "ana@tappyimob.com.br", creci: "345678-F", region: "Centro", rating: 4.9, totalSales: 52, totalValue: 15200000 },
    { name: "Carlos Oliveira", email: "carlos@tappyimob.com.br", creci: "456789-F", region: "Zona Oeste", rating: 4.2, totalSales: 22, totalValue: 5600000 },
    { name: "Fernanda Lima", email: "fernanda@tappyimob.com.br", creci: "567890-F", region: "Zona Leste", rating: 4.7, totalSales: 41, totalValue: 11000000 },
  ];

  for (const c of corretores) {
    const password = await bcrypt.hash("corretor123", 10);
    await prisma.user.upsert({
      where: { email: c.email },
      update: { rating: c.rating, totalSales: c.totalSales, totalValue: c.totalValue },
      create: {
        email: c.email,
        password,
        name: c.name,
        phone: "(11) 99999-0000",
        role: "CORRETOR",
        creci: c.creci,
        region: c.region,
        rating: c.rating,
        totalSales: c.totalSales,
        totalValue: c.totalValue,
        isActive: true,
      },
    });
    console.log("✅ Corretor criado:", c.name);
  }

  // Criar leads
  const leads = [
    { name: "João Silva", email: "joao@email.com", phone: "(11) 99999-1234", status: "NOVO" as const, source: "SITE" as const, score: 85, probability: 75, budget: 450000, tags: ["vip", "financiamento"] },
    { name: "Ana Santos", email: "ana@email.com", phone: "(11) 99999-5678", status: "CONTATADO" as const, source: "WHATSAPP" as const, score: 72, probability: 60, budget: 800000, tags: ["primeira_compra"] },
    { name: "Carlos Oliveira", email: "carlos.o@email.com", phone: "(11) 99999-9012", status: "QUALIFICADO" as const, source: "INDICACAO" as const, score: 92, probability: 85, budget: 650000, tags: ["investidor", "urgente"] },
    { name: "Fernanda Lima", email: "fernanda@email.com", phone: "(11) 99999-3456", status: "NEGOCIANDO" as const, source: "PORTAIS" as const, score: 88, probability: 90, budget: 1200000, tags: ["vip"] },
    { name: "Pedro Almeida", email: "pedro@email.com", phone: "(11) 99999-7890", status: "NOVO" as const, source: "REDES_SOCIAIS" as const, score: 65, probability: 50, budget: 350000, tags: [] },
    { name: "Lucia Mendes", email: "lucia@email.com", phone: "(11) 99999-2345", status: "CONTATADO" as const, source: "TELEFONE" as const, score: 78, probability: 65, budget: 550000, tags: ["financiamento"] },
  ];

  for (const lead of leads) {
    await prisma.lead.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        source: lead.source,
        score: lead.score,
        probability: lead.probability,
        budget: lead.budget,
        tags: lead.tags,
        corretorId: corretor.id,
      },
    });
    console.log("✅ Lead criado:", lead.name);
  }

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📋 Credenciais de acesso:");
  console.log("   Admin:    admin@tappyimob.com.br / admin123");
  console.log("   Corretor: corretor@tappyimob.com.br / corretor123");
  console.log("   Cliente:  cliente@email.com / cliente123");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
