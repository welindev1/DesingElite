const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('notify')
    .setDescription('Notifica al usuario que su ticket ha sido respondido')
    .addStringOption(option =>
      option.setName('mensaje')
        .setDescription('Mensaje adicional para el usuario')
        .setRequired(false)),
        
  async execute(interaction) {
    // Verificar que el comando se ejecute en un canal de ticket
    const channel = interaction.channel;
    
    // Obtener el ID del usuario del topic del canal (que se establece al crear el ticket)
    const userId = channel.topic;
    
    if (!userId) {
      return interaction.reply({
        content: '❌ Este comando solo puede usarse en canales de ticket válidos.',
        ephemeral: true
      });
    }

    // Verificar permisos
    if (!interaction.member.roles.cache.has(config.ticketRoleId)) {
      return interaction.reply({
        content: '❌ Solo el equipo de soporte puede usar este comando.',
        ephemeral: true
      });
    }

    // Verificar que está en la categoría correcta
    if (channel.parentId !== config.ticketCategory) {
      return interaction.reply({
        content: '❌ Este comando solo puede usarse en canales de ticket.',
        ephemeral: true
      });
    }

    const additionalMessage = interaction.options.getString('mensaje') || '';

    try {
      // Obtener el usuario
      const user = await interaction.client.users.fetch(userId);
      
      // Crear embed de notificación
      const notifyEmbed = new EmbedBuilder()
        .setTitle('📬 ¡Tu ticket ha sido respondido!')
        .setDescription(`Un miembro del equipo ha respondido a tu ticket. ${additionalMessage}`)
        .addFields(
          {
            name: '📌 Recuerda',
            value: 'Por favor revisa el ticket para ver la respuesta del equipo.'
          }
        )
        .setColor(0x00FF00)
        .setFooter({ text: 'Welin Store - Soporte' });

      // Crear botón para ir al ticket
      const ticketButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Ir al ticket')
          .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
          .setStyle(ButtonStyle.Link)
      );

      // Intentar enviar el mensaje al privado del usuario
      await user.send({ 
        content: `📢 Hola, tu ticket en **${interaction.guild.name}** ha recibido una respuesta:`,
        embeds: [notifyEmbed],
        components: [ticketButton]
      });

      await interaction.reply({
        content: '✅ Notificación enviada al usuario por privado con enlace al ticket.',
        ephemeral: true
      });

    //   // Opcional: Dejar un mensaje en el ticket confirmando que se notificó al usuario
    //   await channel.send({
    //     content: `📢 Se ha notificado por privado a <@${userId}> sobre la respuesta.`
    //   });

    } catch (error) {
      console.error('Error al enviar mensaje privado:', error);
      
      // Si falla el envío al privado, enviar al canal del ticket como fallback
      const notifyEmbed = new EmbedBuilder()
        .setTitle('📬 ¡Tu ticket ha sido respondido!')
        .setDescription(`Un miembro del equipo ha respondido a tu ticket. ${additionalMessage}`)
        .addFields(
          {
            name: '📌 Recuerda',
            value: 'Por favor mantén la conversación en este canal y espera nuevas respuestas del equipo.'
          }
        )
        .setColor(0x00FF00)
        .setFooter({ text: 'Welin Store - Soporte' });

      await channel.send({ 
        content: `📢 <@${userId}>`, 
        embeds: [notifyEmbed] 
      });
      
      await interaction.reply({
        content: '⚠ No se pudo enviar la notificación al privado. Se envió en el canal del ticket.',
        ephemeral: true
      });
    }
  }
};