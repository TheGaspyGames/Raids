const fs = require("fs");
const path = require("path");

const OWNER_ID = "684395420004253729";
const serversPath = path.join(__dirname, "../servers.json");

module.exports = {
    name: "añadirservidor",
    description: "Protege un servidor para que el bot no se salga tras 10 min de inactividad.",
    run: async (message) => {
        if (message.author.id !== OWNER_ID) {
            return message.reply("🚫 No tienes permiso para usar este comando.");
        }

        const guildId = message.guild.id;

        let servers = [];
        if (fs.existsSync(serversPath)) {
            servers = JSON.parse(fs.readFileSync(serversPath, "utf8"));
        }

        if (servers.includes(guildId)) {
            return message.reply("✅ Este servidor ya está protegido.");
        }

        servers.push(guildId);
        fs.writeFileSync(serversPath, JSON.stringify(servers, null, 2));

        message.reply(`🛡️ El servidor **${message.guild.name}** ahora está protegido. El bot no se saldrá por inactividad.`);
    }
};

