// seed_products.cjs - Script para insertar productos de prueba
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://elite_use:elite_pass@localhost:5432/desing_elite',
});

const products = [
  {
    name: 'Script FiveM HUD Premium',
    description: 'HUD completo estilo GTA V con barra de salud, armadura, hambre, sed y más. Totalmente personalizable con colores y posiciones. Soporte 24/7 incluido.',
    short_description: 'HUD premium con múltiples elementos configurables',
    price: 24.99,
    category: 'scripts',
    image: 'https://i.imgur.com/JkMxOEu.png',
    gallery_images: JSON.stringify([]),
    video_url: null,
    download_link: null,
    visible: true,
    sort_order: 10,
  },
  {
    name: 'Sistema de Trabajos Avanzado',
    description: 'Sistema completo de trabajos con más de 15 profesiones, progresión por nivel, sueldos dinámicos y misiones únicas. Compatible con ESX y QBCore.',
    short_description: 'Más de 15 trabajos con progresión y misiones',
    price: 39.99,
    category: 'scripts',
    image: 'https://i.imgur.com/7oTVAWi.png',
    gallery_images: JSON.stringify([]),
    video_url: null,
    download_link: null,
    visible: true,
    sort_order: 9,
  },
  {
    name: 'Script de Economía Completa',
    description: 'Sistema bancario completo con cuentas, transferencias, historial de transacciones, tarjetas de crédito y cajeros automáticos. Integración total con el servidor.',
    short_description: 'Banco completo con tarjetas y cajeros ATM',
    price: 49.99,
    category: 'scripts',
    image: 'https://i.imgur.com/mT4YHNS.png',
    gallery_images: JSON.stringify([]),
    video_url: null,
    download_link: null,
    visible: true,
    sort_order: 8,
  },
  {
    name: 'Pack Servidor Starter',
    description: 'Todo lo necesario para lanzar tu servidor desde cero. Incluye HUD, trabajos básicos, economía, chat personalizado y panel de administración. Soporte de instalación incluido.',
    short_description: 'Todo lo que necesitas para empezar tu servidor',
    price: 89.99,
    category: 'combos',
    image: 'https://i.imgur.com/KLpNzXk.png',
    gallery_images: JSON.stringify([]),
    video_url: null,
    download_link: null,
    visible: true,
    sort_order: 7,
  },
  {
    name: 'Plan Soporte Premium',
    description: 'Soporte técnico prioritario durante 30 días para cualquier script de nuestra tienda. Respuesta en menos de 2 horas, sesiones de configuración incluidas.',
    short_description: 'Soporte técnico 24/7 por 30 días',
    price: 19.99,
    category: 'plans',
    image: 'https://i.imgur.com/BqVKMNQ.png',
    gallery_images: JSON.stringify([]),
    video_url: null,
    download_link: null,
    visible: true,
    sort_order: 6,
  },
  {
    name: 'Curso: Configura tu servidor FiveM',
    description: 'Aprende desde cero cómo montar, configurar y optimizar tu servidor FiveM. Más de 5 horas de contenido en video, acceso de por vida y comunidad privada.',
    short_description: '5h+ de video con acceso de por vida',
    price: 29.99,
    category: 'courses',
    image: 'https://i.imgur.com/5gXqHUz.png',
    gallery_images: JSON.stringify([]),
    video_url: null,
    download_link: null,
    visible: true,
    sort_order: 5,
  },
];

async function seed() {
  await client.connect();
  console.log('✅ Connected to database');

  for (const p of products) {
    try {
      await client.query(
        `INSERT INTO products (name, description, short_description, price, category, image, gallery_images, video_url, download_link, visible, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT DO NOTHING`,
        [p.name, p.description, p.short_description, p.price, p.category, p.image, p.gallery_images, p.video_url, p.download_link, p.visible, p.sort_order]
      );
      console.log(`✅ Inserted: ${p.name}`);
    } catch (err) {
      console.error(`❌ Failed: ${p.name}`, err.message);
    }
  }

  await client.end();
  console.log('\n🎉 Seeding complete!');
}

seed();
