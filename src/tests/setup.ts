import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });


import '../dbModels/initModels'; // Ensure models are registered
import sequelize from '../config/db';

beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Drops and recreates tables
});

beforeEach(async () => {
    // Truncate all tables to reset data between tests
    const models = sequelize.models;
    for (const modelName of Object.keys(models)) {
        await models[modelName].destroy({ where: {}, truncate: true, cascade: true, force: true });
    }
});

afterAll(async () => {
    await sequelize.close();
});