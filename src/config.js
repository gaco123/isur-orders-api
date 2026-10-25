'use strict';

function required(name) {
    const value = process.env[name];
    if (value === undefined || value === '') {
        throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
    }
    return value;
}

const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.APP_PORT || process.env.PORT || '3000', 10),
    version: process.env.APP_VERSION || '1.0.0',
    commit: process.env.APP_COMMIT || 'local',
    db: {
        host: required('DB_HOST'),
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: required('DB_NAME'),
        user: required('DB_USER'),
        password: required('DB_PASSWORD'),
        ssl: process.env.DB_SSL === 'true'
    }
};

module.exports = config;