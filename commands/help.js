const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Envía por MD todas las funciones y comandos disponibles del bot.',
    run: async (message, args, client) => {
        const commands = Array.from(client.commands.values())
            .filter(cmd => cmd?.name)
            .sort((a, b) => a.name.localeCompare(b.name));

        const fields = commands.map(cmd => ({
            name: `.${cmd.name} / !${cmd.name}`,
            value: cmd.description || 'Sin descripción disponible.',
            inline: false,
        }));

        const embed = new EmbedBuilder()
            .setColor(0x00b3ff)
            .setTitle('📬 Ayuda del bot')
            .setDescription('El bot responde a los prefijos `!` y `.`.\nEstos son los comandos disponibles:')
            .addFields(fields.length ? fields : [{ name: 'Sin comandos', value: 'No hay comandos registrados.', inline: false }])
            .setFooter({ text: `Pedido por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        if (client.user?.displayAvatarURL()) {
            embed.setThumbnail(client.user.displayAvatarURL());
        }

        try {
            await message.author.send({ embeds: [embed] });
            await message.reply('📨 Te envié la lista de comandos por MD en un embed.');
        } catch (err) {
            console.error('Error enviando el MD de ayuda:', err);
            await message.reply('⚠️ No pude enviarte el MD. Revisa que tengas los MD abiertos.');
        }
    }
};
