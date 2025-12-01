require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// ------------------- Watchdog de inactividad -------------------
const serversPath = path.join(__dirname, "servers.json");
function getProtectedServers() {
    if (!fs.existsSync(serversPath)) return [];
    return JSON.parse(fs.readFileSync(serversPath, "utf8"));
}

const inactivityTimers = new Map();
function resetInactivityTimer(guild) {
    if (inactivityTimers.has(guild.id)) {
        clearTimeout(inactivityTimers.get(guild.id));
    }

    const timeout = setTimeout(async () => {
        try {
            const protectedServers = getProtectedServers();
            if (protectedServers.includes(guild.id)) {
                console.log(`🛡️ ${guild.name} está protegido, no me salgo.`);
                return;
            }

            console.log(`⏳ Inactividad en ${guild.name}, el bot se va...`);
            await guild.leave();
        } catch (err) {
            console.error(`❌ Error al salir de ${guild.name}:`, err.message);
        } finally {
            inactivityTimers.delete(guild.id);
        }
    }, 10 * 60 * 1000); // 10 min

    inactivityTimers.set(guild.id, timeout);
}

// ------------------- Cargar comandos -------------------
client.commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// ------------------- READY -------------------
client.on('ready', () => {
    console.log(`✅ Conectado como ${client.user.tag}`);
});

// ------------------- MENSAJES -------------------
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    if (client.commands.has(cmd)) {
        try {
            await client.commands.get(cmd).run(message, args, client);
            resetInactivityTimer(message.guild); // 🔹 reinicia temporizador
        } catch (err) {
            console.error(err);
            message.reply('❌ Error ejecutando el comando.');
        }
    }
});

// ------------------- LOGIN -------------------
client.login(os.getenv("TOKEN");

