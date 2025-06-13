import { Sequelize } from "sequelize";
import serviceConfig from "./config";

const sequelize = new Sequelize(
    serviceConfig.DB_NAME,
    serviceConfig.DB_USER,
    serviceConfig.DB_PASSWORD,
    {
        host: serviceConfig.DB_HOST,
        port: serviceConfig.DB_PORT,
        dialect: 'postgres',
        logging: false,
    }
);

export default sequelize;