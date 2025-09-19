module.exports = (client) => {
    client.on('ready', () => {
        console.log(`✅ Conectado como ${client.user.tag}`);
        // Inicializar RPC si está habilitado
        const { rpc } = require('../config.json');
        const fs = require('fs');
        const dataPath = require('../data.json');
        let totalUses = 0;
        if (fs.existsSync(dataPath)) {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            totalUses = Object.values(data).reduce((acc, v) => acc + v.uses, 0);
        }
        if (rpc) client.user.setActivity(`He ayudado ${totalUses} servidores`, { type: 'WATCHING' });
    });
};