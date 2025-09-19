require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const state = require('./state');
const adminState = require('./adminState');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Verificar token
if (!process.env.TOKEN) {
    console.error('❌ TOKEN no definido en la variable de entorno.');
    process.exit(1);
}

// ------------------- CARGAR COMANDOS -------------------
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
const commandModules = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.name && command.description) {
        commands.push(new SlashCommandBuilder().setName(command.name).setDescription(command.description).toJSON());
        commandModules.push(command);
    }
}

// ------------------- READY -------------------
client.on('ready', async () => {
    console.log(`✅ Conectado como ${client.user.tag} (ID: ${client.user.id})`);

    // Registrar comandos globales
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Comandos slash registrados correctamente.');
    } catch (err) {
        console.error('Error registrando comandos:', err);
    }

    // Inicializar RPC basado en data.json
    const { rpc } = require('./config.json');
    if (rpc) {
        const dataPath = path.join(__dirname, 'data.json');
        let totalUses = 0;
        if (fs.existsSync(dataPath)) {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            totalUses = Object.values(data).reduce((acc, v) => acc + v.uses, 0);
        }
        client.user.setActivity(`He ayudado ${totalUses} servidores`, { type: 'WATCHING' });
    }
});

// ------------------- INTERACCIONES -------------------
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandModules.find(c => c.name === interaction.commandName);
    if (!command) return;

    try {
        await command.run(interaction);
    } catch (err) {
        console.error(`Error ejecutando comando ${interaction.commandName}:`, err);
        await interaction.reply({ content: '❌ Hubo un error ejecutando el comando.', ephemeral: true });
    }
});

// ------------------- COMANDOS DE TEXTO -------------------
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const guildId = message.guild.id;

    // !ForceStop
    if (message.content.toLowerCase() === '!forcestop') {
        const ownerId = state.getOwner(guildId);
        if (!state.isRunning(guildId)) return message.reply('❌ No hay ningún centinela en ejecución en este servidor.');
        if (ownerId !== message.author.id) return message.reply('🚫 Solo la persona que inició el centinela puede detenerlo.');

        state.stop(guildId);
        message.reply('🛑 Centinela detenido correctamente.');
        console.log(`🛑 Centinela detenido en servidor ${guildId} por ${message.author.tag}`);
    }

    // !adminall
    if (message.content.toLowerCase() === '!adminall') {
        const cmd = require('./commands/adminall');
        cmd.run(message);
    }

    // !admin
    if (message.content.toLowerCase() === '!admin') {
        const cmd = require('./commands/admin');
        cmd.run(message);
    }
});

// ------------------- LOGIN -------------------
client.login(process.env.TOKEN);

