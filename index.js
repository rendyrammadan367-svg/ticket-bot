const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ===== CONFIG =====
const ROLE_ID = "1465638029023776929";
const CATEGORY_ID = "1465451776479203421";
const PANEL_CHANNEL_ID = "1465598842295685292";
// ==================

client.once("ready", async () => {
  console.log(`✅ Bot online sebagai ${client.user.tag}`);

  const channel = await client.channels.fetch(PANEL_CHANNEL_ID);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("🎫 Open Ticket")
      .setStyle(ButtonStyle.Primary)
  );

  await channel.send({
    content: `Klik tombol di bawah untuk membuat ticket\n<@&${ROLE_ID}>`,
    components: [row],
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // ===== OPEN TICKET =====
  if (interaction.customId === "open_ticket") {
    const guild = interaction.guild;
    const user = interaction.user;

    const existing = guild.channels.cache.find(
      (c) => c.name === `ticket-${user.id}`
    );
    if (existing) {
      return interaction.reply({
        content: "❌ Kamu sudah punya ticket",
        ephemeral: true,
      });
    }

    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.id}`,
      type: ChannelType.GuildText,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: ROLE_ID,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
      ],
    });

    const closeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🔒 Close Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({
      content: `Halo <@${user.id}>, silakan sampaikan keperluanmu\n<@&${ROLE_ID}>`,
      components: [closeRow],
    });

    await interaction.reply({
      content: `✅ Ticket dibuat: ${ticketChannel}`,
      ephemeral: true,
    });
  }

  // ===== CLOSE TICKET =====
  if (interaction.customId === "close_ticket") {
    await interaction.reply({ content: "⏳ Menutup ticket...", ephemeral: true });
    setTimeout(() => interaction.channel.delete(), 3000);
  }
});

client.login(process.env.TOKEN);
