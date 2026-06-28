import { PrismaClient } from "@prisma/client";
type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type Role = "ADMIN" | "SUPER_ADMIN";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Categories
  const electronics = await prisma.category.upsert({
    where: { slug: "electronique-domotique" },
    update: {},
    create: {
      slug: "electronique-domotique",
      name: { fr: "Électronique & Domotique", en: "Electronics & Smart Home" },
      icon: "Zap",
    },
  });

  const food = await prisma.category.upsert({
    where: { slug: "alimentation" },
    update: {},
    create: {
      slug: "alimentation",
      name: { fr: "Alimentation", en: "Food & Grocery" },
      icon: "ShoppingBasket",
    },
  });

  // Products
  const products = [
    {
      slug: "ampoule-led-connectee",
      name: { fr: "Ampoule LED Connectée", en: "Smart LED Bulb" },
      description: {
        fr: "Ampoule LED intelligente compatible Wi-Fi, contrôlable depuis votre smartphone. 16 millions de couleurs, programmable et économe en énergie.",
        en: "Wi-Fi compatible smart LED bulb, controllable from your smartphone. 16 million colors, programmable and energy-efficient.",
      },
      price: 14990,
      stock: 45,
      images: ["https://picsum.photos/seed/ampoule-led-connectee/800/600"],
      featured: true,
      categoryId: electronics.id,
    },
    {
      slug: "camera-surveillance-hd",
      name: { fr: "Caméra de Surveillance HD", en: "HD Security Camera" },
      description: {
        fr: "Caméra IP 1080p avec vision nocturne, détection de mouvement et stockage cloud. Installation facile, accès à distance depuis l'app.",
        en: "1080p IP camera with night vision, motion detection and cloud storage. Easy installation, remote access from the app.",
      },
      price: 45000,
      stock: 18,
      images: ["https://picsum.photos/seed/camera-surveillance-hd/800/600"],
      featured: true,
      categoryId: electronics.id,
    },
    {
      slug: "prise-intelligente-wifi",
      name: { fr: "Prise Intelligente Wi-Fi", en: "Smart Wi-Fi Plug" },
      description: {
        fr: "Prise connectée avec mesure de consommation électrique en temps réel. Compatible avec Amazon Alexa et Google Home. Programmation horaire intégrée.",
        en: "Connected plug with real-time electrical consumption measurement. Compatible with Amazon Alexa and Google Home. Built-in timer.",
      },
      price: 9900,
      stock: 62,
      images: ["https://picsum.photos/seed/prise-intelligente-wifi/800/600"],
      featured: true,
      categoryId: electronics.id,
    },
    {
      slug: "routeur-wifi-6-pro",
      name: { fr: "Routeur Wi-Fi 6 Pro", en: "Wi-Fi 6 Pro Router" },
      description: {
        fr: "Routeur Wi-Fi 6 double bande avec couverture jusqu'à 150m². Idéal pour les maisons connectées avec de nombreux appareils simultanés.",
        en: "Dual-band Wi-Fi 6 router with coverage up to 150m². Ideal for connected homes with many simultaneous devices.",
      },
      price: 89000,
      stock: 12,
      images: ["https://picsum.photos/seed/routeur-wifi-6-pro/800/600"],
      featured: false,
      categoryId: electronics.id,
    },
    {
      slug: "thermostat-connecte",
      name: { fr: "Thermostat Connecté", en: "Smart Thermostat" },
      description: {
        fr: "Thermostat intelligent avec apprentissage automatique de vos habitudes. Réduisez votre consommation d'énergie jusqu'à 23% par mois.",
        en: "Smart thermostat with automatic learning of your habits. Reduce your energy consumption by up to 23% per month.",
      },
      price: 35000,
      stock: 8,
      images: ["https://picsum.photos/seed/thermostat-connecte/800/600"],
      featured: false,
      categoryId: electronics.id,
    },
    {
      slug: "serrure-connectee",
      name: { fr: "Serrure Connectée", en: "Smart Lock" },
      description: {
        fr: "Serrure intelligente avec empreinte digitale, code PIN et clé physique. Compatible avec les serrures standards. Journal d'accès complet.",
        en: "Smart lock with fingerprint, PIN code and physical key. Compatible with standard locks. Complete access log.",
      },
      price: 55000,
      stock: 15,
      images: ["https://picsum.photos/seed/serrure-connectee/800/600"],
      featured: true,
      categoryId: electronics.id,
    },
    {
      slug: "huile-palme-rouge-artisanale",
      name: { fr: "Huile de Palme Rouge Artisanale", en: "Artisanal Red Palm Oil" },
      description: {
        fr: "Huile de palme rouge 100% naturelle, pressée à froid. Riche en vitamines A et E. Produite localement par des artisans camerounais.",
        en: "100% natural cold-pressed red palm oil. Rich in vitamins A and E. Locally produced by Cameroonian artisans.",
      },
      price: 3500,
      stock: 120,
      images: ["https://picsum.photos/seed/huile-palme-rouge-artisanale/800/600"],
      featured: true,
      categoryId: food.id,
    },
    {
      slug: "cafe-arabica-cameroun",
      name: { fr: "Café Arabica du Cameroun", en: "Cameroon Arabica Coffee" },
      description: {
        fr: "Café Arabica haut de gamme des montagnes de l'Ouest Cameroun. Torréfaction artisanale, arômes fruités et légèrement chocolatés. Sachet 500g.",
        en: "Premium Arabica coffee from the mountains of Western Cameroon. Artisanal roasting, fruity and slightly chocolatey aromas. 500g bag.",
      },
      price: 8500,
      stock: 85,
      images: ["https://picsum.photos/seed/cafe-arabica-cameroun/800/600"],
      featured: true,
      categoryId: food.id,
    },
    {
      slug: "miel-naturel-savane",
      name: { fr: "Miel Naturel de Savane", en: "Natural Savannah Honey" },
      description: {
        fr: "Miel pur de brousse récolté par des apiculteurs locaux dans les savanes du Nord Cameroun. Non pasteurisé, riche en enzymes. Pot 500g.",
        en: "Pure bush honey harvested by local beekeepers in the savannas of North Cameroon. Unpasteurized, enzyme-rich. 500g jar.",
      },
      price: 7000,
      stock: 40,
      images: ["https://picsum.photos/seed/miel-naturel-savane/800/600"],
      featured: false,
      categoryId: food.id,
    },
    {
      slug: "poivre-penja-blanc",
      name: { fr: "Poivre de Penja Blanc", en: "White Penja Pepper" },
      description: {
        fr: "Poivre blanc de Penja, indication géographique protégée (IGP). Considéré parmi les meilleurs poivres au monde. Sachets 100g.",
        en: "White Penja pepper, protected geographical indication (PGI). Considered among the best peppers in the world. 100g bags.",
      },
      price: 4500,
      stock: 65,
      images: ["https://picsum.photos/seed/poivre-penja-blanc/800/600"],
      featured: false,
      categoryId: food.id,
    },
    {
      slug: "cacao-poudre-premium",
      name: { fr: "Cacao en Poudre Premium", en: "Premium Cocoa Powder" },
      description: {
        fr: "Poudre de cacao pur, sans sucre ajouté. Issu de fèves sélectionnées des plantations de la région du Centre. Riche en antioxydants. 250g.",
        en: "Pure cocoa powder, no added sugar. Made from selected beans from Central region plantations. Rich in antioxidants. 250g.",
      },
      price: 5500,
      stock: 90,
      images: ["https://picsum.photos/seed/cacao-poudre-premium/800/600"],
      featured: false,
      categoryId: food.id,
    },
    {
      slug: "hub-domotique-central",
      name: { fr: "Hub Domotique Central", en: "Central Smart Home Hub" },
      description: {
        fr: "Centrale domotique compatible Zigbee, Z-Wave et Wi-Fi. Contrôlez jusqu'à 200 appareils connectés depuis une seule interface. Compatible Google et Alexa.",
        en: "Smart home hub compatible with Zigbee, Z-Wave and Wi-Fi. Control up to 200 connected devices from a single interface. Compatible with Google and Alexa.",
      },
      price: 65000,
      stock: 7,
      images: ["https://picsum.photos/seed/hub-domotique-central/800/600"],
      featured: false,
      categoryId: electronics.id,
    },
  ];

  // for (const product of products) {
  //   await prisma.product.upsert({
  //     where: { slug: product.slug },
  //     update: {},
  //     create: {
  //       ...product,
  //       price: product.price / 100,
  //     },
  //   });
  // }

  // Admins
  const superAdminPassword = await bcrypt.hash("Admin@2024!", 12);


  await prisma.admin.upsert({
    where: { email: "benjaminservice.oqata@gmail.com" },
    update: {},
    create: {
      email: "benjaminservice.oqata@gmail.com",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
    },
  });

  // Test orders
  const allProducts = await prisma.product.findMany({ take: 6 });
  const statuses: OrderStatus[] = [
    "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED",
    "PENDING", "CONFIRMED", "DELIVERED", "DELIVERED", "PENDING",
    "SHIPPED", "DELIVERED", "CONFIRMED", "PENDING", "CANCELLED",
  ];

  const customers = [
    { firstName: "Jean", lastName: "Dupont", email: "jean@example.com", phone: "+237 6 70 12 34 56" },
    { firstName: "Marie", lastName: "Nguema", email: "marie@example.com", phone: "+237 6 55 23 45 67" },
    { firstName: "Paul", lastName: "Biya", email: "paul@example.com", phone: "+237 6 99 34 56 78" },
    { firstName: "Camille", lastName: "Martin", email: "camille@example.com", phone: "+237 6 77 45 67 89" },
    { firstName: "Sophie", lastName: "Mballa", email: "sophie@example.com", phone: "+237 6 88 56 78 90" },
  ];

  const modes = ["standard", "express", "relay"];
  const slots = ["morning", "afternoon", "evening"];

  for (let i = 0; i < 15; i++) {
    const customer = customers[i % customers.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const orderProducts = allProducts.slice(0, Math.floor(Math.random() * 3) + 1);
    const orderNumber = `HC-${createdAt.getFullYear()}-${String(i + 1).padStart(5, "0")}`;

    let total = 0;
    const items = orderProducts.map((p: typeof allProducts[0]) => {
      const qty = Math.floor(Math.random() * 3) + 1;
      total += Number(p.price) * qty;
      return { productId: p.id, quantity: qty, unitPrice: p.price };
    });

    await prisma.order.upsert({
      where: { orderNumber },
      update: {},
      create: {
        orderNumber,
        status: statuses[i],
        customer,
        delivery: {
          address: `${Math.floor(Math.random() * 999) + 1} Rue de la Paix`,
          city: "Douala",
          district: "Akwa",
          zip: "237",
          mode: modes[i % modes.length],
          slot: slots[i % slots.length],
          notes: i % 3 === 0 ? "Sonner deux fois" : null,
        },
        total,
        createdAt,
        items: {
          create: items,
        },
      },
    });
  }

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
