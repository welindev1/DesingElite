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
    .setName('cupon')
    .setDescription('Gestionar cupones')
    .addSubcommand(sub =>
      sub.setName('crear')
        .setDescription('Crear un cupón de descuento')
        .addStringOption(opt => opt.setName('codigo').setDescription('Código del cupón').setRequired(true))
        .addIntegerOption(opt => opt.setName('descuento').setDescription('Valor del descuento').setRequired(true))
        .addBooleanOption(opt => opt.setName('porcentaje').setDescription('¿Es porcentaje? (default: true)').setRequired(false))
        .addIntegerOption(opt => opt.setName('dias').setDescription('Días de validez (default: 30)').setRequired(false))
    ),

  async execute(interaction) {
    // Verificar rol admin
    if (!interaction.member.roles.cache.has(config.adminRoleId)) {
      return interaction.reply({ content: '❌ No tienes permiso para usar este comando.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    const sub = interaction.options.getSubcommand();

    try {
      if (sub === 'crear') {
        const code = interaction.options.getString('codigo');
        const discount = interaction.options.getInteger('descuento');
        const isPercentage = interaction.options.getBoolean('porcentaje') ?? true;
        const daysValid = interaction.options.getInteger('dias') || 30;

        const result = await api('/bot/coupons', 'POST', {
          code,
          discount,
          is_percentage: isPercentage,
          days_valid: daysValid,
        });

        const embed = new EmbedBuilder()
          .setTitle('🏷️ Cupón Creado')
          .setColor(0xf1c40f)
          .addFields(
            { name: 'Código', value: `\`${result.code}\``, inline: true },
            { name: 'Descuento', value: result.discount, inline: true },
            { name: 'Válido hasta', value: new Date(result.expires_at).toLocaleDateString('es-ES'), inline: true },
          )
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error en /cupon:', error);
      return interaction.editReply({ content: `❌ Error: ${error.message}` });
    }
  },
};
