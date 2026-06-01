const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Mostrar métodos de pago disponibles'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('💳 | Métodos de Pago - Welin Store')
      .setDescription('Selecciona el método de pago que prefieras para ver la información correspondiente.')
      .setColor(0xE60000)
      .setFooter({ 
        text: 'Gracias por tu apoyo 💖', 
        iconURL: interaction.client.user.displayAvatarURL() 
      });

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('cashapp')
        .setLabel('Cash App')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('paypal')
        .setLabel('PayPal')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('popular')
        .setLabel('Popular')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('bhd')
        .setLabel('BHD')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [botones] });

    const collector = interaction.channel.createMessageComponentCollector({
      time: 60_000, // 1 minuto
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: '❌ Solo quien ejecutó el comando puede usar estos botones.', ephemeral: true });
      }

      if (i.customId === 'cashapp') {
        const cashEmbed = new EmbedBuilder()
          .setTitle('💵 Cash App')
          .setDescription(`Aquí está tu enlace para enviar el pago:\n\n[Ir a Cash App](https://cash.app/$DisenosElite)`)
          .setColor(0x00C244);
        await i.reply({ embeds: [cashEmbed], ephemeral: true });
      }

      if (i.customId === 'paypal') {
        const paypalEmbed = new EmbedBuilder()
          .setTitle('💰 PayPal')
          .setDescription(`Realiza tu pago usando el siguiente enlace:\n\n${config.paypalLink}`)
          .setColor(0x0079C1);
        await i.reply({ embeds: [paypalEmbed], ephemeral: true });
      }

      if (i.customId === 'popular') {
        const popularEmbed = new EmbedBuilder()
          .setTitle('🏦 Banco Popular')
          .setDescription(
            `**Número de cuenta:** 843404336\n` +
            `**Titular:** Jose Manuel Villar Santos\n` +
            `**Cédula:** 402-2940697-6`
          )
          .setColor(0x003DA5);
        await i.reply({ embeds: [popularEmbed], ephemeral: true });
      }

      if (i.customId === 'bhd') {
        const bhdEmbed = new EmbedBuilder()
          .setTitle('🏦 Banco BHD')
          .setDescription(
            `**Número de cuenta:** 27486460011\n` +
            `**Titular:** Yahaira Santos\n` +
            `**Cédula:** 001-1688440-4`
          )
          .setColor(0xE41E26);
        await i.reply({ embeds: [bhdEmbed], ephemeral: true });
      }
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch (err) {
        // Ignorar si ya fue eliminado
      }
    });
  },
};
