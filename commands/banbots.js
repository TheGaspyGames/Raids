module.exports = {
    name: "banbots",
    description: "Banea a todos los bots del servidor.",
    run: async (message) => {
        const bots = message.guild.members.cache.filter(m => m.user.bot);

        if (bots.size === 0) {
            return message.reply("🤖 No hay bots en este servidor.");
        }

        const results = await Promise.allSettled(
            bots.map(member =>
                member.bannable
                    ? member.ban({ reason: "Ban masivo de bots" })
                    : Promise.reject(`⚠️ No pude banear al bot ${member.user.tag}`)
            )
        );

        let success = 0;
        let fails = 0;

        results.forEach(r => {
            if (r.status === "fulfilled") success++;
            else fails++;
        });

        await message.channel.send(`✅ Se banearon **${success}** bots.\n⚠️ Fallaron **${fails}**.`);
    }
};

