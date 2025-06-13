import { DataTypes, HasManyGetAssociationsMixin, Model, Optional } from "sequelize";
import sequelize from "../config/db"; // Adjust the import path as necessary
import AuthProvider from "./AuthProviderModel";

interface UserAttributes {
    id: string;
    email: string;
    passwordHash: string | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

if (!(DataTypes as any).CITEXT) {
    (DataTypes as any).CITEXT = 'CITEXT';
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'passwordHash' | 'isActive'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public email!: string;
    public passwordHash!: string | null;
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getAuthProviders!: HasManyGetAssociationsMixin<AuthProvider>;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: (DataTypes as any).CITEXT,
            unique: true,
            allowNull: false,
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
    }
);

export default User;