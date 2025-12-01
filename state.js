// state.js
// Controla raids/centinelas por servidor

const servers = {};

/**
 * Intenta iniciar un raid en un servidor.
 * @param {string} guildId
 * @param {string} userId
 * @returns {boolean} true si se inició, false si ya había uno activo
 */
function start(guildId, userId) {
    if (!servers[guildId]) servers[guildId] = { running: false, ownerId: null };
    if (servers[guildId].running) return false;
    servers[guildId].running = true;
    servers[guildId].ownerId = userId;
    return true;
}

/**
 * Detiene el raid de un servidor.
 * @param {string} guildId
 * @returns {boolean} true si se detuvo
 */
function stop(guildId) {
    if (!servers[guildId]) return false;
    servers[guildId].running = false;
    servers[guildId].ownerId = null;
    return true;
}

/**
 * Verifica si hay un raid activo en un servidor.
 * @param {string} guildId
 * @returns {boolean}
 */
function isRunning(guildId) {
    return servers[guildId]?.running || false;
}

/**
 * Devuelve el ID del usuario que inició el raid en un servidor.
 * @param {string} guildId
 * @returns {string|null}
 */
function getOwner(guildId) {
    return servers[guildId]?.ownerId || null;
}

module.exports = {
    start,
    stop,
    isRunning,
    getOwner
};

