// adminState.js
// Controla que solo un usuario por servidor pueda ejecutar los comandos de admin
module.exports = {
    servers: {},

    start(guildId, userId) {
        if (!this.servers[guildId]) this.servers[guildId] = { ownerId: null };
        if (this.servers[guildId].ownerId) return false; // ya hay alguien
        this.servers[guildId].ownerId = userId;
        return true;
    },

    stop(guildId) {
        if (!this.servers[guildId]) return false;
        this.servers[guildId].ownerId = null;
        return true;
    },

    getOwner(guildId) {
        return this.servers[guildId] ? this.servers[guildId].ownerId : null;
    }
};

