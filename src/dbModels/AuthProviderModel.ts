import { BelongsToGetAssociationMixin, DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './UserModel';

interface AuthProviderAttributes {
    id: number;
    userId: string;
    provider: string;
    providerId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

interface AuthProviderCreationAttributes extends Optional<AuthProviderAttributes, 'id' | 'providerId'> { }

class AuthProvider extends Model<AuthProviderAttributes, AuthProviderCreationAttributes> implements AuthProviderAttributes {
    public id!: number;
    public userId!: string;
    public provider!: string;
    public providerId!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getUser!: BelongsToGetAssociationMixin<User>;
}

AuthProvider.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        providerId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'AuthProvider',
        tableName: 'auth_providers',
        timestamps: true,
    }
);

export default AuthProvider;