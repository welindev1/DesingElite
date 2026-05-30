// Traducciones completas para ES, EN, PT
export type Lang = 'ES' | 'EN' | 'PT';

export const LANGUAGES: { code: Lang; flagUrl: string; label: string }[] = [
  { code: 'ES', flagUrl: 'https://flagcdn.com/w20/es.png', label: 'Español' },
  { code: 'EN', flagUrl: 'https://flagcdn.com/w20/us.png', label: 'English' },
  { code: 'PT', flagUrl: 'https://flagcdn.com/w20/br.png', label: 'Português' },
];

export const translations = {
  ES: {
    // Navbar
    nav_home: 'Inicio',
    nav_products: 'Productos',
    nav_services: 'Servicios',
    nav_contact: 'Contacto',
    nav_login: 'Login',
    nav_discord: 'Discord',
    cart_login_toast: 'Debes iniciar sesión para ver el carrito',

    // Hero
    hero_welcome: 'Bienvenido a',
    hero_desc: 'Los mejores mods estilo FiveM para MTA, con calidad, seguridad e innovación para tu experiencia de juego.',
    hero_btn_shop: 'Ver productos',
    hero_btn_services: 'Ver Servicios',
    hero_stat_clients: 'Clientes',
    hero_stat_products: 'Productos',
    hero_subtitle: 'COMENZAR LA AVENTURA',
    
    // Shop
    shop_title: 'Nuestros',
    shop_title_highlight: 'Productos',
    shop_subtitle: 'Scripts premium para llevar tu servidor MTA al siguiente nivel',
    shop_filters: 'Filtros',
    shop_clear_filters: 'Limpiar',
    shop_prices: 'Precios',
    shop_categories: 'Categorías',
    shop_search_placeholder: 'Buscar productos...',
    shop_products_count: 'producto(s)',
    shop_empty_title: 'No se encontraron productos',
    shop_empty_subtitle: 'Intenta con otros filtros o términos de búsqueda',

    // Top Buyers
    buyers_label: 'Comunidad',
    buyers_title_1: 'Top',
    buyers_title_2: 'Compradores',
    buyers_desc: 'Nuestros clientes más activos y fieles de la comunidad Diseño Elite. ¡Gracias por su apoyo!',
    buyers_cta: 'Ver nuestra tienda',
    buyers_badge_title: 'Sé el #1',
    buyers_badge_desc: 'Compra y sube en el ranking',
    buyers_purchases: 'compras',

    // Reviews
    reviews_label: 'Reseñas',
    reviews_title_1: 'Lo que dice',
    reviews_title_2: 'la comunidad',
    reviews_desc: 'Feedback real de quienes ya usan nuestros sistemas. Sin filtros, sin ediciones.',
    reviews_cta: 'Únete al Discord',
    reviews_count: 'reseñas',

    // FAQ
    faq_label: 'Soporte',
    faq_title_1: 'Preguntas',
    faq_title_2: 'Frecuentes',
    faq_desc: 'Resolvemos las dudas más comunes sobre nuestros productos y servicios. ¿No encuentras lo que buscas?',
    faq_cta: 'Pregunta en Discord',
    faq_items: [
      { q: '¿Cómo funciona la licencia?', a: 'Cada script incluye una licencia vinculada a tu IP de servidor. Al comprar recibes acceso inmediato con soporte incluido.' },
      { q: '¿Cuánto tiempo tarda la entrega?', a: 'La entrega es instantánea tras el pago. Recibes el script en tu panel de usuario.' },
      { q: '¿Ofrecen soporte técnico?', a: 'Sí, todos nuestros productos incluyen soporte técnico a través del servidor de Discord.' },
      { q: '¿Puedo usar el script en múltiples servidores?', a: 'Cada licencia es para un único servidor. Si necesitas más, contáctanos para planes especiales.' },
      { q: '¿Aceptan reembolsos?', a: 'Evaluamos cada caso individualmente. Contáctanos dentro de las 24h posteriores a la compra.' },
    ],

    // Footer
    footer_tagline: 'Scripts premium para llevar tu servidor MTA al siguiente nivel.',
    footer_rights: 'Todos los derechos reservados.',
    
    // Product Detail
    prod_gallery: 'Galería',
    prod_image: 'imagen',
    prod_images: 'imágenes',
    prod_zoom_hint: 'Clic en cualquier imagen para ampliar',
    prod_instant_delivery: 'Entrega Instantánea',
    prod_free_access: 'Acceso gratuito',
    prod_lifetime: 'Pago único, acceso de por vida',
    prod_paypal_fee: 'comisión PayPal',
    prod_add_to_cart: 'Agregar al Carrito',
    prod_added_to_cart: 'Agregado al Carrito',
    prod_view_cart: 'Ver Carrito',
    prod_back_to_shop: 'Volver a la Tienda',
    prod_features: 'Características',
    prod_description: 'Descripción',
    prod_watch_video: 'Ver Video',
    prod_view_images: 'Ver Imágenes',
  },

  EN: {
    nav_home: 'Home',
    nav_products: 'Products',
    nav_services: 'Services',
    nav_contact: 'Contact',
    nav_login: 'Login',
    nav_discord: 'Discord',
    cart_login_toast: 'You must log in to view the cart',

    hero_welcome: 'Welcome to',
    hero_desc: 'The best FiveM-style mods for MTA, with quality, security and innovation for your gaming experience.',
    hero_btn_shop: 'Browse products',
    hero_btn_services: 'View Services',
    hero_stat_clients: 'Clients',
    hero_stat_products: 'Products',

    // Shop
    shop_title: 'Our',
    shop_title_highlight: 'Products',
    shop_subtitle: 'Premium scripts to take your MTA server to the next level',
    shop_filters: 'Filters',
    shop_clear_filters: 'Clear',
    shop_prices: 'Prices',
    shop_categories: 'Categories',
    shop_search_placeholder: 'Search products...',
    shop_products_count: 'product(s)',
    shop_empty_title: 'No products found',
    shop_empty_subtitle: 'Try adjusting your filters or search terms',

    buyers_label: 'Community',
    buyers_title_1: 'Top',
    buyers_title_2: 'Buyers',
    buyers_desc: 'Our most active and loyal customers of the Diseño Elite community. Thank you for your support!',
    buyers_cta: 'Visit our store',
    buyers_badge_title: 'Be #1',
    buyers_badge_desc: 'Buy and climb the rankings',
    buyers_purchases: 'purchases',

    reviews_label: 'Reviews',
    reviews_title_1: 'What the',
    reviews_title_2: 'community says',
    reviews_desc: 'Real feedback from those who already use our systems. No filters, no edits.',
    reviews_cta: 'Join Discord',
    reviews_count: 'reviews',

    faq_label: 'Support',
    faq_title_1: 'Frequently',
    faq_title_2: 'Asked Questions',
    faq_desc: "We resolve the most common questions about our products and services. Can't find what you're looking for?",
    faq_cta: 'Ask on Discord',
    faq_items: [
      { q: 'How does the license work?', a: 'Each script includes a license tied to your server IP. Upon purchase you get instant access with support included.' },
      { q: 'How long does delivery take?', a: 'Delivery is instant after payment. You receive the script in your user panel.' },
      { q: 'Do you offer technical support?', a: 'Yes, all our products include technical support through the Discord server.' },
      { q: 'Can I use the script on multiple servers?', a: 'Each license is for a single server. If you need more, contact us for special plans.' },
      { q: 'Do you accept refunds?', a: 'We evaluate each case individually. Contact us within 24h of purchase.' },
    ],

    footer_tagline: 'Premium scripts to take your MTA server to the next level.',
    footer_rights: 'All rights reserved.',

    // Product Detail
    prod_gallery: 'Gallery',
    prod_image: 'image',
    prod_images: 'images',
    prod_zoom_hint: 'Click on any image to zoom',
    prod_instant_delivery: 'Instant Delivery',
    prod_free_access: 'Free access',
    prod_lifetime: 'One-time payment, lifetime access',
    prod_paypal_fee: 'PayPal fee',
    prod_add_to_cart: 'Add to Cart',
    prod_added_to_cart: 'Added to Cart',
    prod_view_cart: 'View Cart',
    prod_back_to_shop: 'Back to Store',
    prod_features: 'Features',
    prod_description: 'Description',
    prod_watch_video: 'Watch Video',
    prod_view_images: 'View Images',
  },

  PT: {
    nav_home: 'Início',
    nav_products: 'Produtos',
    nav_services: 'Serviços',
    nav_contact: 'Contato',
    nav_login: 'Login',
    nav_discord: 'Discord',
    cart_login_toast: 'Você deve fazer login para ver o carrinho',

    hero_welcome: 'Bem-vindo a',
    hero_desc: 'Os melhores mods estilo FiveM para MTA, com qualidade, segurança e inovação para sua experiência de jogo.',
    hero_btn_shop: 'Ver produtos',
    hero_btn_services: 'Ver Serviços',
    hero_stat_clients: 'Clientes',
    hero_stat_products: 'Produtos',

    // Shop
    shop_title: 'Nossos',
    shop_title_highlight: 'Produtos',
    shop_subtitle: 'Scripts premium para elevar o seu servidor MTA ao próximo nível',
    shop_filters: 'Filtros',
    shop_clear_filters: 'Limpar',
    shop_prices: 'Preços',
    shop_categories: 'Categorias',
    shop_search_placeholder: 'Buscar produtos...',
    shop_products_count: 'produto(s)',
    shop_empty_title: 'Nenhum produto encontrado',
    shop_empty_subtitle: 'Tente com outros filtros ou termos de pesquisa',

    buyers_label: 'Comunidade',
    buyers_title_1: 'Top',
    buyers_title_2: 'Compradores',
    buyers_desc: 'Nossos clientes mais ativos e fiéis da comunidade Diseño Elite. Obrigado pelo apoio!',
    buyers_cta: 'Ver nossa loja',
    buyers_badge_title: 'Seja o #1',
    buyers_badge_desc: 'Compre e suba no ranking',
    buyers_purchases: 'compras',

    reviews_label: 'Avaliações',
    reviews_title_1: 'O que diz',
    reviews_title_2: 'a comunidade',
    reviews_desc: 'Feedback real de quem já usa nossos sistemas. Sem filtros, sem edições.',
    reviews_cta: 'Entrar no Discord',
    reviews_count: 'avaliações',

    faq_label: 'Suporte',
    faq_title_1: 'Perguntas',
    faq_title_2: 'Frequentes',
    faq_desc: 'Resolvemos as dúvidas mais comuns sobre nossos produtos e serviços. Não encontrou o que procura?',
    faq_cta: 'Pergunte no Discord',
    faq_items: [
      { q: 'Como funciona a licença?', a: 'Cada script inclui uma licença vinculada ao IP do seu servidor. Ao comprar você recebe acesso imediato com suporte incluído.' },
      { q: 'Quanto tempo leva a entrega?', a: 'A entrega é instantânea após o pagamento. Você recebe o script no seu painel de usuário.' },
      { q: 'Vocês oferecem suporte técnico?', a: 'Sim, todos os nossos produtos incluem suporte técnico através do servidor do Discord.' },
      { q: 'Posso usar o script em múltiplos servidores?', a: 'Cada licença é para um único servidor. Se precisar de mais, entre em contato para planos especiais.' },
      { q: 'Aceitam reembolsos?', a: 'Avaliamos cada caso individualmente. Entre em contato em até 24h após a compra.' },
    ],

    footer_tagline: 'Scripts premium para levar seu servidor MTA ao próximo nível.',
    footer_rights: 'Todos os direitos reservados.',

    // Product Detail
    prod_gallery: 'Galeria',
    prod_image: 'imagem',
    prod_images: 'imagens',
    prod_zoom_hint: 'Clique em qualquer imagem para ampliar',
    prod_instant_delivery: 'Entrega Instantânea',
    prod_free_access: 'Acesso gratuito',
    prod_lifetime: 'Pagamento único, acesso vitalício',
    prod_paypal_fee: 'comissão do PayPal',
    prod_add_to_cart: 'Adicionar ao Carrinho',
    prod_added_to_cart: 'Adicionado ao Carrinho',
    prod_view_cart: 'Ver Carrinho',
    prod_back_to_shop: 'Voltar para a Loja',
    prod_features: 'Características',
    prod_description: 'Descrição',
    prod_watch_video: 'Ver Vídeo',
    prod_view_images: 'Ver Imagens',
  },
} as const;

export type TranslationKey = keyof typeof translations.ES;
