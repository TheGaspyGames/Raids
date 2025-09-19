// state.js
// Guarda el estado de centinela por servidor
// Estructura:
// {
//   [guildId]: { running: true/false, ownerId: 'id del usuario' }
// }

module.exports = {
    servers: {},

    /**
     * Intenta iniciar un centinela en un servidor.
     * @param {string} guildId - ID del servidor
     * @param {string} userId - ID del usuario que ejecuta el centinela
     * @returns {boolean} - true si se inició correctamente, false si ya había uno activo
     */
    start(guildId, userId) {
        if (!this.servers[guildId]) this.servers[guildId] = { running: false, ownerId: null };
        if (this.servers[guildId].running) return false; // Ya hay centinela activo
        this.servers[guildId].running = true;
        this.servers[guildId].ownerId = userId;
        return true;
    },

    /**
     * Detiene el centinela de un servidor.
     * @param {string} guildId - ID del servidor
     * @returns {boolean} - true si se detuvo correctamente
     */
    stop(guildId) {
        if (!this.servers[guildId]) return false;
        this.servers[guildId].running = false;
        this.servers[guildId].ownerId = null;
        return true;
    },

    /**
     * Verifica si hay un centinela activo en un servidor
     * @param {string} guildId
     * @returns {boolean}
     */
    isRunning(guildId) {
        return this.servers[guildId] ? this.servers[guildId].running : false;
    },

    /**
     * Devuelve el ID del usuario que inició el centinela en un servidor
     * @param {string} guildId
     * @returns {string|null}
     */
    getOwner(guildId) {
        return this.servers[guildId] ? this.servers[guildId].ownerId : null;
    }
};

