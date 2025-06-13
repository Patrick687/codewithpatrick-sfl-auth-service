import AuthProvider from "./AuthProviderModel";
import User from "./UserModel";

User.hasMany(AuthProvider, { foreignKey: 'userId', as: 'authProviders' });
AuthProvider.belongsTo(User, { foreignKey: 'userId', as: 'user' });