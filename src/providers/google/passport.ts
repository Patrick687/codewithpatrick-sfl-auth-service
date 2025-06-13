import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import AuthProvider from '../../dbModels/AuthProviderModel';
import User from '../../dbModels/UserModel';
import serviceConfig from '../../config/config';
import { Transaction } from 'sequelize';
import sequelize from '../../config/db';

passport.use(new GoogleStrategy(
    {
        clientID: serviceConfig.GOOGLE_CLIENT_ID,
        clientSecret: serviceConfig.GOOGLE_CLIENT_SECRET,
        callbackURL: serviceConfig.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
        const transaction: Transaction = await sequelize.transaction();
        try {
            let authProvider = await AuthProvider.findOne({
                where: { provider: 'google', providerId: profile.id },
                include: [User],
            });

            if (!authProvider) {
                const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
                if (!email) {
                    return done(new Error('No email found in Google profile'));
                }
                const user = await User.create({ email, passwordHash: null }, { transaction });
                authProvider = await AuthProvider.create({
                    userId: user.id,
                    provider: 'google',
                    providerId: profile.id,
                }, { transaction });
                await transaction.commit();
                return done(null, user);
            }

            await transaction.commit();
            return done(null, authProvider.getUser());
        } catch (err) {
            await transaction.rollback();
            return done(err);
        }
    }
));

export default passport;