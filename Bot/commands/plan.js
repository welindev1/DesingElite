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
    .setName('plan')
    .setDescription('Gestionar planes')
    .addSubcommand(sub =>
      sub.setName('listar')
        .setDescription('Ver todos los planes')
    )
    .addSubcommand(sub =>
      sub.setName('dar')
        .setDescription('Dar plan a un usuario')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addIntegerOption(opt => opt.setName('plan_id').setDescription('ID del plan').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('quitar')
        .setDescription('Quitar plan de un usuario')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addIntegerOption(opt => opt.setName('plan_id').setDescription('ID del plan').setRequired(true))
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
        const plans = await api('/bot/plans');

        if (!plans.length) {
          return interaction.editReply({ content: '📋 No hay planes registrados.' });
        }

        const embed = new EmbedBuilder()
          .setTitle('📋 Lista de Planes')
          .setColor(0xFF0000)
          .setDescription(
            plans.map(p =>
              `**ID ${p.id}** — ${p.name}\n` +
              `💰 $${p.price} USD | ⏱️ ${p.duration_days} días | ${p.is_active ? '🟢 Activo' : '🔴 Inactivo'}`
            ).join('\n\n')
          )
          .setFooter({ text: `Total: ${plans.length} planes` })
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'dar') {
        const user = interaction.options.getUser('usuario');
        const planId = interaction.options.getInteger('plan_id');

        const result = await api('/bot/add-plan', 'POST', {
          discord_id: user.id,
          plan_id: planId,
        });

        const embed = new EmbedBuilder()
          .setTitle('✅ Plan Asignado')
          .setColor(0x2ecc71)
          .addFields(
            { name: 'Usuario', value: `<@${user.id}>`, inline: true },
            { name: 'Plan ID', value: `${planId}`, inline: true },
            { name: 'Expira', value: new Date(result.expires_at).toLocaleDateString('es-ES'), inline: true },
          )
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'quitar') {
        const user = interaction.options.getUser('usuario');
        const planId = interaction.options.getInteger('plan_id');

        await api('/bot/remove-plan', 'POST', {
          discord_id: user.id,
          plan_id: planId,
        });

        const embed = new EmbedBuilder()
          .setTitle('🗑️ Plan Removido')
          .setColor(0xe74c3c)
          .addFields(
            { name: 'Usuario', value: `<@${user.id}>`, inline: true },
            { name: 'Plan ID', value: `${planId}`, inline: true },
          )
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error en /plan:', error);
      return interaction.editReply({ content: `❌ Error: ${error.message}` });
    }
  },
};
