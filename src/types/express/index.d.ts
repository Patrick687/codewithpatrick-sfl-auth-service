import User from '../../dbModels/UserModel';

declare global {
    namespace Express {
        interface User extends User { }
        // interface Request {
        //     user?: User;
        // }
    }
}