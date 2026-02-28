import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const SALT_ROUNDS = 12;

  const adminHash = await bcrypt.hash('Admin@123', SALT_ROUNDS);
  const userHash = await bcrypt.hash('User@123', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@supplylink.com.br' },
    update: {},
    create: {
      name: 'Administrador SupplyLink',
      email: 'admin@supplylink.com.br',
      passwordHash: adminHash,
      role: Role.ADMIN,
      companyName: 'SupplyLink Admin',
      cnpj: '00.000.000/0001-00',
      status: UserStatus.ACTIVE,
    },
  });

  const categories = await Promise.all(
    ['Metais', 'Polímeros', 'Químicos', 'Têxteis', 'Madeira'].map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name, description: `Categoria de matéria-prima: ${name}` },
      }),
    ),
  );

  const factory1 = await prisma.user.upsert({
    where: { email: 'fabrica1@example.com' },
    update: {},
    create: {
      name: 'Indústria ABC Ltda',
      email: 'fabrica1@example.com',
      passwordHash: userHash,
      role: Role.FACTORY,
      companyName: 'Indústria ABC',
      cnpj: '11.111.111/0001-11',
      address: 'Rua das Indústrias, 100 - São Paulo/SP',
      status: UserStatus.ACTIVE,
    },
  });

  const factory2 = await prisma.user.upsert({
    where: { email: 'fabrica2@example.com' },
    update: {},
    create: {
      name: 'Manufatura XYZ S.A.',
      email: 'fabrica2@example.com',
      passwordHash: userHash,
      role: Role.FACTORY,
      companyName: 'Manufatura XYZ',
      cnpj: '22.222.222/0001-22',
      address: 'Av. Brasil, 500 - Campinas/SP',
      status: UserStatus.ACTIVE,
    },
  });

  const supplier1 = await prisma.user.upsert({
    where: { email: 'fornecedor1@example.com' },
    update: {},
    create: {
      name: 'MetalForce Distribuição',
      email: 'fornecedor1@example.com',
      passwordHash: userHash,
      role: Role.SUPPLIER,
      companyName: 'MetalForce',
      cnpj: '33.333.333/0001-33',
      address: 'Rod. Anhanguera, km 50 - Jundiaí/SP',
      status: UserStatus.ACTIVE,
    },
  });

  const supplier2 = await prisma.user.upsert({
    where: { email: 'fornecedor2@example.com' },
    update: {},
    create: {
      name: 'PolySupply Comércio',
      email: 'fornecedor2@example.com',
      passwordHash: userHash,
      role: Role.SUPPLIER,
      companyName: 'PolySupply',
      cnpj: '44.444.444/0001-44',
      address: 'Rua dos Polímeros, 200 - Guarulhos/SP',
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      {
        supplierId: supplier1.id,
        categoryId: categories[0].id,
        name: 'Aço Carbono 1020',
        description: 'Barra de aço carbono 1020, diâmetro 25mm',
        unit: 'kg',
        basePrice: 8.5,
        stockQty: 5000,
        images: [],
      },
      {
        supplierId: supplier1.id,
        categoryId: categories[0].id,
        name: 'Alumínio 6061',
        description: 'Chapa de alumínio 6061-T6, espessura 3mm',
        unit: 'kg',
        basePrice: 22.0,
        stockQty: 2000,
        images: [],
      },
      {
        supplierId: supplier2.id,
        categoryId: categories[1].id,
        name: 'Polietileno HDPE',
        description: 'Granulado de polietileno de alta densidade',
        unit: 'ton',
        basePrice: 4500.0,
        stockQty: 100,
        images: [],
      },
      {
        supplierId: supplier2.id,
        categoryId: categories[2].id,
        name: 'Soda Cáustica',
        description: 'Hidróxido de sódio em escamas, pureza 99%',
        unit: 'kg',
        basePrice: 3.2,
        stockQty: 10000,
        images: [],
      },
    ],
  });

  console.log('Seed executado com sucesso!');
  console.log({ admin: admin.email, factory1: factory1.email, factory2: factory2.email, supplier1: supplier1.email, supplier2: supplier2.email });
  console.log(`Categorias criadas: ${categories.map((c) => c.name).join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
