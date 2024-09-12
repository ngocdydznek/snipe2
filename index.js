const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
require('dotenv').config();

// Tạo ứng dụng Express để giữ bot hoạt động 24/7
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot đang chạy');
});

app.listen(port, () => {
    console.log(`Máy chủ đang chạy trên cổng ${port}`);
});

// Tạo client Discord với các quyền cần thiết
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

// Lưu trữ các tin nhắn đã xóa
let tinNhanDaXoa = new Map();

// Xử lý khi tin nhắn bị xóa
client.on('messageDelete', (message) => {
    if (message.partial || message.author.bot) return;

    tinNhanDaXoa.set(message.channel.id, {
        content: message.content,
        author: message.author,
        time: message.createdAt,
        image: message.attachments.first() ? message.attachments.first().proxyURL : null,
    });
});

// Xử lý lệnh `!snipe`
client.on('messageCreate', async (message) => {
    if (message.content.toLowerCase() === '!snipe') {
        const snipedMessage = tinNhanDaXoa.get(message.channel.id);

        if (!snipedMessage) {
            return message.channel.send('Không có tin nhắn nào để snipe!');
        }

        const embed = new EmbedBuilder()
            .setColor(0xff9900)
            .setAuthor({ name: snipedMessage.author.tag, iconURL: snipedMessage.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(snipedMessage.content || "*Không có nội dung văn bản*")
            .setFooter({ text: `Sniped bởi ${message.author.tag}` })
            .setTimestamp(snipedMessage.time);

        if (snipedMessage.image) {
            embed.setImage(snipedMessage.image);
        }

        message.channel.send({ embeds: [embed] });
    }
});

// Đăng nhập bot với token từ tệp .env
client.login(process.env.DISCORD_TOKEN);
