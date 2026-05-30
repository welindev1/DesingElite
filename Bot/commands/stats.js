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

const formatCurrency = (n) => `$${Number(n || 0).toFixed(2)} USD`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Ver estadísticas de la tienda'),

  async execute(interaction) {
    // Verificar rol admin
    if (!interaction.member.roles.cache.has(config.adminRoleId)) {
      return interaction.reply({ content: '❌ No tienes permiso para usar este comando.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const stats = await api('/bot/stats');
      const { summary } = stats;

      const embed = new EmbedBuilder()
        .setTitle('📊 Estadísticas de WelinStore')
        .setColor(0xFF0000)
        .addFields(
          { name: '💰 Revenue Total', value: formatCurrency(summary.total_revenue), inline: true },
          { name: '👥 Usuarios Totales', value: `${summary.total_users}`, inline: true },
          { name: '📦 Productos Activos', value: `${summary.active_products}`, inline: true },
          { name: '\u200B', value: '**━━━ Ventas ━━━**', inline: false },
          { name: '📅 Hoy', value: `${summary.purchases_today.count} ventas\n${formatCurrency(summary.purchases_today.revenue)}`, inline: true },
          { name: '📆 Esta Semana', value: `${summary.purchases_week.count} ventas\n${formatCurrency(summary.purchases_week.revenue)}`, inline: true },
          { name: '🗓️ Este Mes', value: `${summary.purchases_month.count} ventas\n${formatCurrency(summary.purchases_month.revenue)}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: 'WelinStore Dashboard' });

      // Agregar compras recientes si hay
      if (stats.recent_purchases?.length) {
        const recentText = stats.recent_purchases.slice(0, 5).map(p =>
          `• **${p.user?.username || 'Unknown'}** - ${formatCurrency(p.price_paid)} (${new Date(p.created_at).toLocaleDateString('es-ES')})`
        ).join('\n');
        embed.addFields({ name: '🛒 Compras Recientes', value: recentText || 'Sin compras', inline: false });
      }

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error en /stats:', error);
      return interaction.editReply({ content: `❌ Error: ${error.message}` });
    }
  },
};
