require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

if (!process.env.TOKEN) {
    console.error('❌ TOKEN no definido en la variable de entorno.');
    process.exit(1);
}

// Cargar eventos
require('./handlers/events')(client);

// Cargar comandos
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(new SlashCommandBuilder().setName(command.name).setDescription(command.description).toJSON());
}

// Registrar comandos
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(client.user?.id || process.env.CLIENT_ID), { body: commands });
        console.log('Comandos slash registrados.');
    } catch (err) {
        console.error('Error registrando comandos:', err);
    }
})();

// Ejecutar comando al recibir interacción
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = commandFiles.map(f => require(`./commands/${f}`)).find(c => c.name === interaction.commandName);
    if (command) await command.run(interaction);
});

client.login(process.env.TOKEN);
