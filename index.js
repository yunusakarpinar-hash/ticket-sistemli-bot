const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    ChannelType,
    PermissionsBitField 
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const TOKEN = config.TOKEN;
const PREFIX = config.PREFIX;
const { BILET_LIMITI } = config.TICKET_AYARLARI;
const KOMUTLAR = config.KOMUTLAR;
const MESAJLAR = config.MESAJLAR;
const EMBEDS = config.EMBEDS;

const dbPath = path.join(__dirname, 'database.json');

function readDatabase() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { settings: {}, users: {} }; 
    }
}

function writeDatabase(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Veritabani yazma hatasi:', error.message);
    }
}

function logTicket(guild, guildSettings, logMessage) {
    const logChannel = guild.channels.cache.get(guildSettings.logChannelId);
    if (logChannel) {
        const embed = new EmbedBuilder()
            .setColor(logMessage.includes('Kapatıldı') ? 0xFF0000 : 0x00FF00)
            .setDescription(logMessage)
            .setTimestamp();
        logChannel.send({ embeds: [embed] });
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('ready', () => {
    console.log(`Bot Hazir! Giris yapildi: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild || !message.content.startsWith(PREFIX)) return;
    
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const guildId = message.guild.id;
    const db = readDatabase();

    if (!db.settings[guildId]) {
        db.settings[guildId] = {};
    }
    const guildSettings = db.settings[guildId];

    if (command === KOMUTLAR.AYARLA || command === KOMUTLAR.PANEL_KUR) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply(MESAJLAR.YETKI_YOK);
        }
    }

    if (command === KOMUTLAR.AYARLA) {
        if (args.length !== 3) {
            return message.reply(
                MESAJLAR.AYAR_EKSİK
                    .replace('{prefix}', PREFIX)
                    .replace('{komut}', KOMUTLAR.AYARLA)
            );
        }
        
        const [kategoriId, destekRolId, logKanaliId] = args;
        
        if (!kategoriId || !destekRolId || !logKanaliId) {
             return message.reply(MESAJLAR.AYAR_EKSİK.replace('{prefix}', PREFIX).replace('{komut}', KOMUTLAR.AYARLA));
        }

        guildSettings.kategoriId = kategoriId;
        guildSettings.destekRolId = destekRolId;
        guildSettings.logChannelId = logKanaliId;
        
        writeDatabase(db); 

        return message.reply(
            MESAJLAR.AYAR_TAMAM
                .replace('{kategori}', `<#${kategoriId}>`)
                .replace('{rol}', `<@&${destekRolId}>`)
                .replace('{log}', `<#${logKanaliId}>`)
        );
    }
    
    if (!guildSettings.kategoriId || !guildSettings.destekRolId || !guildSettings.logChannelId) {
        if (command !== KOMUTLAR.PANEL_KUR) return; 

        return message.reply(
            MESAJLAR.AYAR_YOK
                .replace('{prefix}', PREFIX)
                .replace('{komut}', KOMUTLAR.AYARLA)
        );
    }

    if (command === KOMUTLAR.PANEL_KUR) {
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(EMBEDS.PANEL_BASLIK)
            .setDescription(EMBEDS.PANEL_ACIKLAMA);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('open_ticket')
                    .setLabel('Bilet Ac')
                    .setStyle(ButtonStyle.Success),
            );

        message.channel.send({ embeds: [embed], components: [row] });
        message.delete().catch(() => {});
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() || !interaction.guild) return;

    const guild = interaction.guild;
    const member = interaction.member;
    const guildId = guild.id;
    const db = readDatabase();
    
    const guildSettings = db.settings[guildId];
    
    if (!guildSettings || !guildSettings.kategoriId || !guildSettings.destekRolId) {
        return interaction.reply({ content: MESAJLAR.AYAR_YOK.replace('{prefix}', PREFIX).replace('{komut}', KOMUTLAR.AYARLA), ephemeral: true });
    }
    
    const { kategoriId, destekRolId } = guildSettings;

    if (interaction.customId === 'open_ticket') {
        
        const openTickets = guild.channels.cache.filter(c => 
            c.type === ChannelType.GuildText && 
            c.topic && 
            c.topic.includes(`user:${member.id}`) &&
            c.parent && c.parent.id === kategoriId
        ).size;

        if (openTickets >= BILET_LIMITI) {
            return interaction.reply({ content: MESAJLAR.BILET_ACIK.replace('{limit}', BILET_LIMITI), ephemeral: true });
        }

        try {
            const ticketChannel = await guild.channels.create({
                name: `destek-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                type: ChannelType.GuildText,
                parent: kategoriId,
                topic: `Destek Bileti | Acan: ${member.user.tag} | user:${member.id}`,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: member.id, 
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: destekRolId,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: client.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    }
                ],
            });

            const welcomeEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(EMBEDS.WELCOME_BASLIK)
                .setDescription(EMBEDS.WELCOME_ACIKLAMA.replace('{user}', member))
                .addFields(
                    { name: 'Ac an Kullanici', value: `${member.user.tag}`, inline: true },
                    { name: 'Destek Ekibi', value: `<@&${destekRolId}>`, inline: true }
                );

            const closeRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Bileti Kapat')
                        .setStyle(ButtonStyle.Danger),
                );

            await ticketChannel.send({ content: `<@${member.id}> | <@&${destekRolId}>`, embeds: [welcomeEmbed], components: [closeRow] });

            interaction.reply({ content: MESAJLAR.BILET_ACILDI.replace('{channel}', ticketChannel), ephemeral: true });
            logTicket(guild, guildSettings, `Bilet Acildi: #${ticketChannel.name} | Acan: ${member.user.tag} (${member.id})`);

        } catch (error) {
            console.error('Bilet acilirken hata olustu:', error);
            interaction.reply({ content: MESAJLAR.HATA_GENEL, ephemeral: true });
        }
    } 

    else if (interaction.customId === 'close_ticket') {
        if (interaction.channel.type !== ChannelType.GuildText || interaction.channel.parentId !== kategoriId) {
            return interaction.reply({ content: MESAJLAR.BUTON_KANALI_DEGISMEZ, ephemeral: true });
        }

        const isStaff = member.roles.cache.has(destekRolId) || member.permissions.has(PermissionsBitField.Flags.Administrator);
        const isOwner = interaction.channel.topic && interaction.channel.topic.includes(`user:${member.id}`);

        if (!isStaff && !isOwner) {
            return interaction.reply({ content: MESAJLAR.YETKI_KAPATMA, ephemeral: true });
        }

        const confirmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_close')
                    .setLabel('Kapatmayi Onayla')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel_close')
                    .setLabel('Iptal Et')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ content: MESAJLAR.BILET_KAPANMA_SORU, components: [confirmRow], ephemeral: true });
    }

    else if (interaction.customId === 'confirm_close') {
        const channel = interaction.channel;
        
        const topic = channel.topic || "";
        const userIdMatch = topic.match(/user:(\d+)/);
        const ticketOwnerId = userIdMatch ? userIdMatch[1] : 'Bilinmiyor';
        const ticketOwner = await client.users.fetch(ticketOwnerId).catch(() => ({ tag: 'Bilinmeyen Kullanici' }));

        const logMessage = MESAJLAR.BILET_KAPATILDI_LOG
            .replace('{channelName}', channel.name)
            .replace('{user}', ticketOwner.tag)
            .replace('{closer}', interaction.user.tag);
        
        await interaction.update({ content: MESAJLAR.BILET_KAPANDI, components: [] });

        logTicket(guild, guildSettings, logMessage);

        setTimeout(() => {
            channel.delete().catch(err => console.error('Kanal silinirken hata:', err));
        }, 5000);
    }
    
    else if (interaction.customId === 'cancel_close') {
        await interaction.update({ content: 'Kapatma islemi iptal edildi.', components: [] });
    }
});

client.login(TOKEN);
