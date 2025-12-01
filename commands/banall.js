// banall.js
module.exports = {
  name: 'banall',
  description: 'Banea a todos los usuarios (excepto quien ejecuta el comando y el owner del guild). Ejecutable por cualquier usuario.',
  run: async (message) => {
    try {
      const guild = message.guild;
      const executorId = message.author.id;
      const botMember = guild.me || guild.members.cache.get(message.client.user.id);
      const guildOwnerId = guild.ownerId || guild.ownerID; // compatibilidad

      // comprobar permisos del bot
      if (!botMember.permissions.has('BAN_MEMBERS')) {
        return message.reply('❌ No tengo el permiso **BAN_MEMBERS**. Dale ese permiso al bot primero.');
      }

      // asegurar caché completa
      await guild.members.fetch();

      const members = guild.members.cache.filter(m =>
        !m.user.bot &&
        m.id !== executorId && // no banear al que ejecuta
        m.id !== guildOwnerId   // no banear al owner del guild
      );

      if (members.size === 0) {
        return message.reply('⚠️ No hay miembros para banear (excluyendo bots, tú y el owner).');
      }

      let banned = 0;
      let failed = 0;

      for (const [id, member] of members) {
        if (!member.bannable) {
          failed++;
          console.log(`No baneable: ${member.user.tag} (${id})`);
          continue;
        }

        try {
          await guild.members.ban(id, { reason: `BanAll ejecutado por ${message.author.tag}` });
          banned++;
          // pequeña pausa para mitigar rate limits
          await new Promise(r => setTimeout(r, 250));
        } catch (err) {
          failed++;
          console.error(`Error baneando ${member.user.tag}:`, err);
        }
      }

      return message.reply(`✅ Operación finalizada. Baneados: ${banned}. Fallidos: ${failed}.`);
    } catch (error) {
      console.error('banall error:', error);
      return message.reply('❌ Ocurrió un error al intentar banear a los miembros.');
    }
  }
};

