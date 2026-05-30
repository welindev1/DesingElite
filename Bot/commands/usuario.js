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
    .setName('usuario')
    .setDescription('Gestionar usuarios')
    .addSubcommand(sub =>
      sub.setName('info')
        .setDescription('Ver información de un usuario')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('ban')
        .setDescription('Banear a un usuario de la tienda')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addStringOption(opt => opt.setName('razon').setDescription('Razón del baneo').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('unban')
        .setDescription('Desbanear a un usuario de la tienda')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
    ),

  async execute(interaction) {
    // Verificar rol admin
    if (!interaction.member.roles.cache.has(config.adminRoleId)) {
      return interaction.reply({ content: '❌ No tienes permiso para usar este comando.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    const sub = interaction.options.getSubcommand();

    try {
      if (sub === 'info') {
        const user = interaction.options.getUser('usuario');
        const result = await api(`/bot/user/${user.id}`);

        const embed = new EmbedBuilder()
          .setTitle(`👤 ${result.user.username}`)
          .setThumbnail(user.displayAvatarURL())
          .setColor(result.user.status === 'active' ? 0x2ecc71 : result.user.status === 'banned' ? 0xe74c3c : 0xf39c12)
          .addFields(
            { name: 'Discord ID', value: `\`${result.user.discord_id}\``, inline: true },
            { name: 'Estado', value: result.user.status === 'active' ? '🟢 Activo' : result.user.status === 'banned' ? '🔴 Baneado' : '🟡 Inactivo', inline: true },
            { name: 'Rol', value: result.user.role === 'admin' ? '👑 Admin' : '👤 Usuario', inline: true },
          );

        if (result.license) {
          embed.addFields(
            { name: '🔑 Licencia', value: `\`${result.license.key}\``, inline: false },
            { name: 'Estado Licencia', value: result.license.status, inline: true },
            { name: 'Productos', value: `${result.license.active_products_count}/${result.license.products_count}`, inline: true },
            { name: 'Planes Activos', value: `${result.active_plans}`, inline: true },
          );
        } else {
          embed.addFields({ name: '🔑 Licencia', value: 'No tiene licencia', inline: false });
        }

        embed.setFooter({ text: `Registrado: ${new Date(result.user.created_at).toLocaleDateString('es-ES')}` });
        embed.setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'ban') {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon');

        const result = await api('/bot/ban', 'POST', {
          discord_id: user.id,
          reason,
        });

        const embed = new EmbedBuilder()
          .setTitle('🔨 Usuario Baneado')
          .setColor(0xe74c3c)
          .addFields(
            { name: 'Usuario', value: `<@${user.id}>`, inline: true },
            { name: 'Username', value: result.username, inline: true },
            { name: 'Razón', value: result.reason, inline: false },
          )
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'unban') {
        const user = interaction.options.getUser('usuario');

        const result = await api('/bot/unban', 'POST', {
          discord_id: user.id,
        });

        const embed = new EmbedBuilder()
          .setTitle('✅ Usuario Desbaneado')
          .setColor(0x2ecc71)
          .addFields(
            { name: 'Usuario', value: `<@${user.id}>`, inline: true },
            { name: 'Username', value: result.username, inline: true },
          )
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error en /usuario:', error);
      return interaction.editReply({ content: `❌ Error: ${error.message}` });
    }
  },
};
