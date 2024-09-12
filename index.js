const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

let snipedMessages = new Map();

client.on('messageDelete', (message) => {
    if (message.partial || message.author.bot) return;

    snipedMessages.set(message.channel.id, {
        content: message.content,
        author: message.author,
        time: message.createdAt,
        image: message.attachments.first() ? message.attachments.first().proxyURL : null,
    });
});

client.on('messageCreate', async (message) => {
    if (message.content.toLowerCase() === '!snipe') {
        const snipedMessage = snipedMessages.get(message.channel.id);

        if (!snipedMessage) {
            return message.channel.send('Không có tin nhắn nào được xóa!');
        }

        const embed = new EmbedBuilder()
            .setColor(0xff9900)
            .setAuthor({ name: snipedMessage.author.tag, iconURL: snipedMessage.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(snipedMessage.content || "*No text content*")
            .setFooter({ text: `Sniped by ${message.author.tag}` })
            .setTimestamp(snipedMessage.time);

        if (snipedMessage.image) {
            embed.setImage(snipedMessage.image);
        }

        message.channel.send({ embeds: [embed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
