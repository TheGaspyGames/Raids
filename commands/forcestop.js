const state = require('../state');

module.exports = {
    name: 'forcestop',
    description: 'Detiene el raid activo en el servidor.',
    run: async (message) => {
        const guildId = message.guild.id;
        const author = message.author;

        // comprobar si hay raid
        if (!state.isRunning(guildId)) {
            return message.reply('❌ No hay ningún raid activo en este servidor.');
        }

        // solo quien lanzó el raid puede detenerlo
        const ownerId = state.getOwner(guildId);
        if (ownerId !== author.id) {
            return message.reply('🚫 Solo la persona que inició el raid puede detenerlo.');
        }

        // detener raid
        state.stop(guildId);

        message.reply(`🛑 Raid detenido por ${author.tag}`);
        console.log(`🛑 Raid detenido en servidor ${guildId} por ${author.tag}`);
    }
};

