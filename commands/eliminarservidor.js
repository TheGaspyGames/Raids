const fs = require("fs");
const path = require("path");

const OWNER_ID = "684395420004253729"; // mismo dueño que en añadirservidor
const serversPath = path.join(__dirname, "../servers.json");

module.exports = {
    name: "eliminarservidor",
    description: "Quita la protección de este servidor (el bot podrá salirse tras 10 min de inactividad).",
    run: async (message) => {
        if (message.author.id !== OWNER_ID) {
            return message.reply("🚫 No tienes permiso para usar este comando.");
        }

        const guildId = message.guild.id;

        let servers = [];
        if (fs.existsSync(serversPath)) {
            servers = JSON.parse(fs.readFileSync(serversPath, "utf8"));
        }

        if (!servers.includes(guildId)) {
            return message.reply("⚠️ Este servidor no está protegido.");
        }

        // quitar el id de la lista
        servers = servers.filter(id => id !== guildId);
        fs.writeFileSync(serversPath, JSON.stringify(servers, null, 2));

        message.reply(`❌ El servidor **${message.guild.name}** ya no está protegido. El bot podrá salirse tras inactividad.`);
    }
};

