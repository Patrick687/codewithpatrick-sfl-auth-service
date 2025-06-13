import dotenv from 'dotenv';

dotenv.config();


type NodeEnv = 'development' | 'production' | 'test';
function requireNodeEnv(): NodeEnv {
    const env = process.env.NODE_ENV;
    if (!env) {
        throw new Error('NODE_ENV is not set');
    }
    if (['development', 'production', 'test'].includes(env)) {
        return env as NodeEnv;
    }
    throw new Error(`Invalid NODE_ENV: ${env} - must be one of 'development', 'production', or 'test'`);
}

function requireString(key: string): string {
    const value = process.env[key];
    if (typeof value !== 'string') {
        throw new Error(`Environment variable ${key} is not set or is not a string`);
    }
    return value;
}

function requireInteger(key: string): number {
    const value = process.env[key];
    const intValue = parseInt(value || '', 10);
    if (isNaN(intValue)) {
        throw new Error(`Environment variable ${key} is not set or is not a valid integer`);
    }
    return intValue;
}

const serviceConfig = {
    NODE_ENV: requireNodeEnv(),

    DB_HOST: requireString('DB_HOST'),
    DB_PORT: requireInteger('DB_PORT'),
    DB_USER: requireString('DB_USER'),
    DB_PASSWORD: requireString('DB_PASSWORD'),
    DB_NAME: requireString('DB_NAME'),

    SERVER_HOST: requireString('SERVER_HOST'),
    SERVER_PORT: requireInteger('SERVER_PORT'),

    JWT_SECRET: requireString('JWT_SECRET'),

    GOOGLE_CLIENT_ID: requireString('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: requireString('GOOGLE_CLIENT_SECRET'),
    GOOGLE_CALLBACK_URL: requireString('GOOGLE_CALLBACK_URL'),
};

export default serviceConfig;