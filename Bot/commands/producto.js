const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

const api = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Bot-Secret': config.botSecret,
    },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${config.apiUrl}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data.data || data;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('producto')
    .setDescription('Gestionar productos')
    .addSubcommand(sub =>
      sub.setName('listar')
        .setDescription('Ver todos los productos')
    )
    .addSubcommand(sub =>
      sub.setName('dar')
        .setDescription('Dar producto a un usuario')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addIntegerOption(opt => opt.setName('producto_id').setDescription('ID del producto').setRequired(true))
        .addIntegerOption(opt => opt.setName('dias').setDescription('Días (vacío = permanente)').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('quitar')
        .setDescription('Quitar producto de un usuario')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addIntegerOption(opt => opt.setName('producto_id').setDescription('ID del producto').setRequired(true))
    ),

  async execute(interaction) {
    // Verificar rol admin
    if (!interaction.member.roles.cache.has(config.adminRoleId)) {
      return interaction.reply({ content: '❌ No tienes permiso para usar este comando.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    const sub = interaction.options.getSubcommand();

    try {
      if (sub === 'listar') {
        const products = await api('/bot/products');

        if (!products.length) {
          return interaction.editReply({ content: '📦 No hay productos registrados.' });
        }

        const embed = new EmbedBuilder()
          .setTitle('📦 Lista de Productos')
          .setColor(0xFF0000)
          .setDescription(
            products.map(p =>
              `**ID ${p.id}** — ${p.name}\n` +
              `💰 $${p.price} USD | ${p.is_active ? '🟢 Activo' : '🔴 Inactivo'}`
            ).join('\n\n')
          )
          .setFooter({ text: `Total: ${products.length} productos` })
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'dar') {
        const user = interaction.options.getUser('usuario');
        const productId = interaction.options.getInteger('producto_id');
        const days = interaction.options.getInteger('dias');

        const result = await api('/bot/add-product', 'POST', {
          discord_id: user.id,
          product_id: productId,
          days: days || undefined,
        });

        const embed = new EmbedBuilder()
          .setTitle('✅ Producto Asignado')
          .setColor(0x2ecc71)
          .addFields(
            { name: 'Usuario', value: `<@${user.id}>`, inline: true },
            { name: 'Producto ID', value: `${productId}`, inline: true },
            { name: 'Duración', value: days ? `${days} días` : 'Permanente', inline: true },
            { name: 'Licencia', value: `\`${result.license_key}\``, inline: false },
          )
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'quitar') {
        const user = interaction.options.getUser('usuario');
        const productId = interaction.options.getInteger('producto_id');

        await api('/bot/remove-product', 'POST', {
          discord_id: user.id,
          product_id: productId,
        });

        const embed = new EmbedBuilder()
          .setTitle('🗑️ Producto Removido')
          .setColor(0xe74c3c)
          .addFields(
            { name: 'Usuario', value: `<@${user.id}>`, inline: true },
            { name: 'Producto ID', value: `${productId}`, inline: true },
          )
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error en /producto:', error);
      return interaction.editReply({ content: `❌ Error: ${error.message}` });
    }
  },
};
