// kickall.js
module.exports = {
  name: 'kickall',
  description: 'Expulsa a todos los miembros del servidor excepto quien ejecuta el comando. Ejecutable por cualquier usuario.',
  run: async (message) => {
    try {
      const guild = message.guild;
      const executorId = message.author.id;
      const botMember = guild.me || guild.members.cache.get(message.client.user.id);

      // comprobar permisos del bot
      if (!botMember.permissions.has('KICK_MEMBERS')) {
        return message.reply('❌ No tengo el permiso **KICK_MEMBERS**. Dale ese permiso al bot primero.');
      }

      // asegurar caché completa
      await guild.members.fetch();

      const members = guild.members.cache.filter(m => !m.user.bot && m.id !== executorId);
      if (members.size === 0) {
        return message.reply('⚠️ No hay miembros para expulsar (excluyendo bots y tú).');
      }

      let kicked = 0;
      let failed = 0;

      for (const [id, member] of members) {
        // skip si no es expulsable
        if (!member.kickable) {
          failed++;
          console.log(`No expulsable: ${member.user.tag} (${id})`);
          continue;
        }

        try {
          await member.kick(`KickAll ejecutado por ${message.author.tag}`);
          kicked++;
          // pequeña pausa para mitigar rate limits
          await new Promise(r => setTimeout(r, 250));
        } catch (err) {
          failed++;
          console.error(`Error expulsando ${member.user.tag}:`, err);
        }
      }

      return message.reply(`✅ Operación finalizada. Expulsados: ${kicked}. Fallidos: ${failed}.`);
    } catch (error) {
      console.error('kickall error:', error);
      return message.reply('❌ Ocurrió un error al intentar expulsar a los miembros.');
    }
  }
};

