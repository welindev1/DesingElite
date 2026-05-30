// commands/ticket.js
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendticket')
    .setDescription('Crea un ticket usando un menú desplegable')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ Solo los administradores pueden usar este comando.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Soporte | Welin Store',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setDescription('<:hola:1372394418304450590> Elige un tema abajo para hablar con nuestro equipo')
      .addFields(
        {
          name: '<:time:1372394419331923988> Horario de atención:',
          value: '<:green:1363960719976042747> Nuestro horario de atención es de lunes a domingo: de 8:00AM a 11:00PM.'
        }
      )
      .setColor(0xFF0000)
      .setFooter({
        text: 'Welin Store | Soporte',
        iconURL: interaction.client.user.displayAvatarURL()
      });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket_select')
      .setPlaceholder('Elige un tema')
      .addOptions(
        config.ticketTypes.map(type => ({
          label: type.label,
          value: type.value,
          description: type.description,
          emoji: '🎟️',
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};