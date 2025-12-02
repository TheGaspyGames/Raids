module.exports = {
    name: 'help',
    description: 'Envía por MD todas las funciones y comandos disponibles del bot.',
    run: async (message, args, client) => {
        const commandList = Array.from(client.commands.values())
            .map(cmd => {
                const desc = cmd.description || 'Sin descripción disponible.';
                return `• !${cmd.name} / .${cmd.name}: ${desc}`;
            })
            .join('\n');

        const helpMessage = [
            '🤖 **Ayuda del bot**',
            'El bot responde tanto al prefijo `!` como al prefijo `.`.',
            '',
            '📖 Comandos disponibles:',
            commandList
        ].join('\n');

        try {
            await message.author.send(helpMessage);
            await message.reply('📨 Te envié la lista de comandos por MD.');
        } catch (err) {
            console.error('Error enviando el MD de ayuda:', err);
            await message.reply('❌ No pude enviarte el MD. Revisa que tengas los MD abiertos.');
        }
    }
};
