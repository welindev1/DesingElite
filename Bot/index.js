// Requiere Node.js v16.9+ y discord.js v14+
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActivityType,
  PermissionsBitField,
  StringSelectMenuBuilder
} = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const commands = [];
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('Registrando comandos...');
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );
    console.log('Comandos registrados.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', async interaction => {
  try {
    const logChannel = interaction.guild.channels.cache.get(config.logChannelId);

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'ticket_select') {
        const ticketType = interaction.values[0];
        const userName = interaction.user.username;
        const userMention = interaction.user.toString();

        const ticketTypeConfig = config.ticketTypes.find(type => type.value === ticketType);
        const channelName = `${ticketTypeConfig.emoji}・${ticketType}-${userName.toLowerCase().replace(/\s+/g, '-')}`;

        const ticketChannel = await interaction.guild.channels.create({
          name: channelName,
          type: 0,
          parent: config.ticketCategory,
          topic: interaction.user.id,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: ['ViewChannel'],
            },
            {
              id: config.ticketRoleId,
              allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
            },
            {
              id: interaction.user.id,
              allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
            },
            {
              id: client.user.id,
              allow: ['ViewChannel', 'SendMessages', 'ManageChannels', 'ManageMessages'],
            }
          ],
        });

        const welcomeEmbed = new EmbedBuilder()
          .setTitle('Atención al cliente | Welin Store')
          .setDescription('Déjanos saber cómo podemos ayudarte y espera a que alguien de nuestro equipo se ponga en contacto.\n\n' +
            `📩 **Tema seleccionado:** ${ticketType}\n\n` +
            `💼 **Responsable de soporte:** <@&${config.ticketRoleId}>\n\n` +
            '🕐 **Horario de atención:** Lunes a Domingo (8:00AM a 11:00PM)')
          .setColor(0xFF0000)
          .setFooter({ text: 'Welin Store - Soporte Técnico' });

        const ticketButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Cerrar Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒'),
          new ButtonBuilder()
            .setCustomId('add_user')
            .setLabel('Agregar Usuario')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('👥'),
          new ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('Reclamar Ticket')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🙋'),
          new ButtonBuilder()
            .setCustomId('notify_user')
            .setLabel('Notificar Usuario')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🔔')
        );

        await ticketChannel.send({
          content: `Hola ${userMention}, lee atentamente la información y espera respuesta del equipo.\nResponsable: <@&${config.ticketRoleId}>`,
          embeds: [welcomeEmbed],
          components: [ticketButtons]
        });

        await interaction.reply({
          content: `✅ Ticket creado en ${ticketChannel.toString()}`,
          ephemeral: true
        });

        // Log en canal de logs
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle('📩 Nuevo Ticket')
            .addFields(
              { name: '📂 Canal', value: ticketChannel.name, inline: true },
              { name: '👤 Abierto por', value: interaction.user.tag, inline: true },
              { name: '📝 Tema', value: ticketType }
            )
            .setTimestamp()
            .setColor(0x3498db);
          await logChannel.send({ embeds: [logEmbed] });
        }
      }
    }

    if (interaction.isButton()) {
      const { member, channel, customId } = interaction;

      if (customId === 'close_ticket') {
        if (!member.roles.cache.has(config.ticketRoleId)) {
          return interaction.reply({
            content: '❌ Solo el equipo de soporte puede cerrar tickets.',
            ephemeral: true
          });
        }

        const messages = await channel.messages.fetch({ limit: 100 });
        const participants = new Set();

        let html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Transcript - ${channel.name}</title>
  <style>
    body { font-family: "Segoe UI", sans-serif; background: #2c2f33; color: #fff; padding: 20px; }
    .message { margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 10px; }
    .author { font-weight: bold; color: #00b0f4; }
    .timestamp { color: #aaa; font-size: 0.9em; margin-left: 10px; }
    .content { white-space: pre-wrap; margin-top: 5px; }
  </style>
</head>
<body>
  <h2>Transcript de ${channel.name}</h2>
`;

        messages.reverse().forEach(msg => {
          if (!msg.author.bot) {
            participants.add(msg.author.tag);
            html += `
  <div class="message">
    <span class="author">${msg.author.tag}</span>
    <span class="timestamp">[${msg.createdAt.toLocaleString()}]</span>
    <div class="content">${msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  </div>
`;
          }
        });

        html += '</body></html>';

        const buffer = Buffer.from(html, 'utf-8');
        const openedById = channel.topic;
        const openedByUser = await interaction.guild.members.fetch(openedById).catch(() => null);

        const logEmbed = new EmbedBuilder()
          .setTitle('🔒 Ticket Cerrado')
          .addFields(
            { name: '👤 Abierto por', value: openedByUser ? openedByUser.user.tag : 'Desconocido', inline: true },
            { name: '🗣️ Participantes', value: [...participants].join(', ').slice(0, 1024) || 'Ninguno', inline: false },
            { name: '💬 Total de mensajes', value: `${messages.size}`, inline: true },
            { name: '📂 Canal cerrado', value: channel.name, inline: true },
            { name: '👮 Cerrado por', value: member.user.tag, inline: true }
          )
          .setTimestamp()
          .setColor(0xFF0000);

        if (logChannel) {
          await logChannel.send({
            content: '🎫 Ticket cerrado. Transcript HTML adjunto.',
            embeds: [logEmbed],
            files: [{ attachment: buffer, name: `transcript-${channel.name}.html` }]
          });
        }

        await interaction.reply({
          content: '✅ Ticket cerrado y registrado en el canal de logs.',
          ephemeral: true
        });

        setTimeout(() => {
          channel.delete().catch(console.error);
        }, 5000);
      }

      if (customId === 'add_user') {
        if (!member.roles.cache.has(config.ticketRoleId) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return interaction.reply({
            content: '❌ No tienes permiso para agregar usuarios.',
            ephemeral: true
          });
        }

        await interaction.reply({
          content: 'Menciona al usuario que quieres agregar al ticket (ej: @Usuario)',
          ephemeral: true
        });
      }

      if (customId === 'claim_ticket') {
        if (!member.roles.cache.has(config.ticketRoleId)) {
          return interaction.reply({
            content: '❌ Solo el equipo de soporte puede reclamar tickets.',
            ephemeral: true
          });
        }

        await channel.permissionOverwrites.edit(member.id, {
          ViewChannel: true,
          SendMessages: true
        });

        await channel.send(`🎟️ ${member.toString()} ha reclamado este ticket.`);
        await interaction.reply({
          content: '✅ Has reclamado este ticket correctamente.',
          ephemeral: true
        });

        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle('🙋 Ticket Reclamado')
            .addFields(
              { name: '📂 Canal', value: channel.name, inline: true },
              { name: '👮 Reclutador', value: member.user.tag, inline: true }
            )
            .setTimestamp()
            .setColor(0x00FF00);

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      if (customId === 'notify_user') {
        if (!member.roles.cache.has(config.ticketRoleId)) {
          return interaction.reply({
            content: '❌ Solo el equipo de soporte puede notificar al usuario.',
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

        // Obtener el ID del usuario del topic del canal
        const userId = channel.topic;
        
        if (!userId) {
          return interaction.reply({
            content: '❌ No se pudo identificar al usuario del ticket.',
            ephemeral: true
          });
        }

        try {
          // Obtener el usuario
          const user = await interaction.client.users.fetch(userId);
          
          // Crear embed de notificación
          const notifyEmbed = new EmbedBuilder()
            .setTitle('📬 ¡Tu ticket ha sido respondido!')
            .setDescription('Un miembro del equipo ha respondido a tu ticket.')
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

        } catch (error) {
          console.error('Error al enviar mensaje privado:', error);
          
          // Si falla el envío al privado, enviar al canal del ticket como fallback
          const notifyEmbed = new EmbedBuilder()
            .setTitle('📬 ¡Tu ticket ha sido respondido!')
            .setDescription('Un miembro del equipo ha respondido a tu ticket.')
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
            content: '⚠️ No se pudo enviar la notificación al privado. Se envió en el canal del ticket.',
            ephemeral: true
          });
        }
      }
    }
  } catch (error) {
    console.error('Error en interactionCreate:', error);
    const content = '❌ Ocurrió un error al procesar esta acción.';
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content, ephemeral: true });
    } else {
      await interaction.reply({ content, ephemeral: true });
    }
  }
});

// client.on('messageCreate', async message => {
//   try {
//     if (
//       message.channel.id === config.specificChannelId &&
//       !message.author.bot &&
//       !message.content.startsWith(config.prefix)
//     ) {
//       const content = message.content;
//       const author = message.author;
//       const attachments = message.attachments.map(attachment => attachment.url);

//       await message.delete().catch(console.error);

//       const embed = new EmbedBuilder()
//         .setColor(0xFF0000)
//         .setAuthor({
//           name: `feedback enviado por ${author.username}`,
//           iconURL: author.displayAvatarURL()
//         })
//         .setTitle('Feedback enviado. 💖')
//         .addFields({ name: '**Mensaje del usuario:**', value: content, inline: false })
//         .setFooter({ text: 'Welin Store. ✨ • ' + new Date().toLocaleDateString('es-ES') + ', ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) })
//         .setThumbnail('https://imgur.com/rWhhsZs.png');

//       if (attachments.length > 0) {
//         embed.addFields({ name: '**Adjuntos:**', value: attachments.join('\n') });
//       }

//       const mentions = Array.from(message.mentions.users.values()).map(u => u.toString()).join(' ');
//       const replyContent = mentions ? `${mentions}\n` : '';

//       await message.channel.send({
//         content: replyContent,
//         embeds: [embed]
//       });
//     }
//   } catch (error) {
//     console.error('Error en messageCreate:', error);
//   }
// });

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'Welin Store', type: ActivityType.Playing }],
    status: 'online'
  });

  // Enviar panel de tickets automáticamente
  try {
    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) {
      console.error('❌ No se encontró el servidor configurado');
      return;
    }

    const ticketPanelChannel = guild.channels.cache.get(config.ticketPanelChannelId);
    if (!ticketPanelChannel) {
      console.error('❌ No se encontró el canal para el panel de tickets');
      return;
    }

    // Verificar si ya existe un panel de tickets (buscar mensajes del bot con el embed)
    const messages = await ticketPanelChannel.messages.fetch({ limit: 10 });
    const existingPanel = messages.find(msg => 
      msg.author.id === client.user.id && 
      msg.embeds.length > 0 && 
      msg.embeds[0].author?.name === 'Soporte | Welin Store'
    );

    if (existingPanel) {
      console.log('ℹ️ Panel de tickets ya existe, no se enviará de nuevo');
      return;
    }

    // Crear el panel de tickets
    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Soporte | Welin Store',
        iconURL: client.user.displayAvatarURL()
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
        iconURL: client.user.displayAvatarURL()
      });

    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ticket_select')
        .setPlaceholder('Elige un tema')
        .addOptions(
          config.ticketTypes.map(type => ({
            label: type.label,
            value: type.value,
            description: type.description,
            emoji: '🎟️',
          }))
        )
    );

    await ticketPanelChannel.send({
      embeds: [embed],
      components: [selectMenu]
    });

    console.log('✅ Panel de tickets enviado correctamente');
  } catch (error) {
    console.error('❌ Error al enviar el panel de tickets:', error);
  }
});

client.login(config.token);