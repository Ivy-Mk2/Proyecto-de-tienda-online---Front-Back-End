import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('Admin123!', 10);
  const customerPass = await bcrypt.hash('Customer123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shop.local' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@shop.local',
      passwordHash: adminPass,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@shop.local' },
    update: {},
    create: {
      name: 'Customer User',
      email: 'customer@shop.local',
      passwordHash: customerPass,
      role: UserRole.CUSTOMER,
    },
  });

  const products = [
    {
      name: 'Zapatilla Urbana X1',
      description: 'Zapatilla cómoda para uso diario.',
      price: 89.9,
      stock: 30,
      category: 'Calzado',
      sizes: ['38', '39', '40', '41', '42'],
      colors: ['Negro', 'Blanco'],
      featured: true,
      images: ['/uploads/sample-shoe-1.jpg', '/uploads/sample-shoe-2.jpg'],
    },
    {
      name: 'Remera Basic Premium',
      description: 'Remera de algodón suave, corte regular.',
      price: 24.5,
      stock: 100,
      category: 'Indumentaria',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Azul', 'Gris'],
      featured: false,
      images: ['/uploads/sample-shirt-1.jpg'],
    },
    {
      name: 'Mochila Explorer',
      description: 'Mochila de 25L resistente al agua.',
      price: 59,
      stock: 20,
      category: 'Accesorios',
      sizes: ['Único'],
      colors: ['Verde', 'Negro'],
      featured: true,
      images: ['/uploads/sample-backpack-1.jpg'],
    },
  ];

  for (const item of products) {
    const product = await prisma.product.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        category: item.category,
        sizes: item.sizes,
        colors: item.colors,
        featured: item.featured,
      },
    });

    await prisma.productImage.createMany({
      data: item.images.map((imageUrl, index) => ({
        productId: product.id,
        imageUrl,
        altText: item.name,
        order: index,
      })),
    });
  }

  await prisma.banner.createMany({
    data: [
      {
        title: 'Nueva Colección Otoño',
        subtitle: 'Descubrí lo último de la temporada',
        imageUrl: '/uploads/KanyeWest.jpg',
        ctaText: 'Ver productos',
        ctaLink: '/productos',
        isActive: true,
        orderIndex: 1,
      },
      {
        title: 'Ofertas de Semana',
        subtitle: 'Hasta 30% OFF en seleccionados',
        imageUrl: '/uploads/ade9d580-d18c-4bad-a4b4-11f7e7f8f25d_skate-caps-web.jpg',
        ctaText: 'Comprar ahora',
        ctaLink: '/productos?featured=true',
        isActive: true,
        orderIndex: 2,
      },
      {
        title: 'Promocion imperdible',
        subtitle: 'Hasta 30% OFF en seleccionados',
        imageUrl: '/uploads/WhatsApp-Image-2019-06-11-at-18.04.17.jpg',
        ctaText: 'Comprar ahora',
        ctaLink: '/productos?featured=true',
        isActive: true,
        orderIndex: 3,
      },
    ],
  });

  console.log('Seed complete. Admin user:', admin.email);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
