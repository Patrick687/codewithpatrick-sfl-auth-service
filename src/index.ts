import "./dbModels/initModels";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './config/db';
import serviceConfig from "./config/config";
import router from "./routes";
import { setupSwagger } from './config/swagger';

dotenv.config();

async function start() {
    const app = express();

    app.use(express.json());
    app.use(cors());
    app.use(helmet());

    // Setup Swagger documentation
    setupSwagger(app);

    await sequelize.authenticate();
    console.log('📊 Database connection established');

    // Sync database models (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('🗄️ Database models synchronized');

    app.use('/', router);

    app.listen(serviceConfig.SERVER_PORT, () => {
        console.log(`Auth service listening at http://${serviceConfig.SERVER_HOST}:${serviceConfig.SERVER_PORT}`);
        console.log(`API Documentation available at http://${serviceConfig.SERVER_HOST}:${serviceConfig.SERVER_PORT}/api-docs`);
    });
}

start();;