import "./dbModels/initModels";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './config/db';
import serviceConfig from "./config/config";
import router from "./routes";

dotenv.config();

async function start() {
    const app = express();

    app.use(express.json());
    app.use(cors());
    app.use(helmet());

    await sequelize.authenticate();

    app.use('/', router);

    app.listen(serviceConfig.SERVER_PORT, () => {
        console.log(`Auth service listening at http://${serviceConfig.SERVER_HOST}:${serviceConfig.SERVER_PORT}`);
    });
}

start();;