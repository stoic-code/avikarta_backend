import asyncHandler from '../Utils/asyncHandler.util.js';
import User from '../Models/user.model.js';
import Jwt from 'jsonwebtoken';
import ApiError from '../Utils/apiError.util.js';

const authenticateUser = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        const Token = authHeader && authHeader.split(' ')[1];
        // console.log('Token: ', Token);

        if (!Token) {
            throw new ApiError(401, 'Token is null');
        }

        // verify tokenized user
        const verifyUser = await Jwt.verify(
            Token,
            process.env.ACCESS_TOKEN_SECRET
        );
        if (!verifyUser) {
            throw new ApiError(401, 'User is not authenticated !!');
        }

        req.user = await User.findById(verifyUser._id);

        next();
    } catch (err) {
        next({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

export default authenticateUser;

// const authorizeRoles = (...roles) => {
//     return (req, res, next) => {
//         try {
//             if (!roles.includes(req.user.Role)) {
//                 throw new ApiError(
//                     403,
//                     `Role of ${String(
//                         req.user.Role
//                     ).toUpperCase()} isn't allowed !`
//                 );
//             }
//             next();
//         } catch (err) {
//             next({
//                 statusCode: err.statusCode,
//                 message: err.message,
//             });
//         }
//     };
// };
// export { isAuthenticatedUser, authorizeRoles };
