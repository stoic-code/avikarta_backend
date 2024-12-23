import asyncHandler from '../Utils/asyncHandler.util.js';
import User from '../Models/user.model.js';
import ApiError from '../Utils/apiError.util.js';
import sendTokenResponse from '../Utils/sendTokenRes.util.js';
import sendEmail from '../Utils/sendEmail.util.js';
import { ObjectId } from 'mongodb';

//registration
const registerUser = asyncHandler(async (req, res) => {
    try {
        // console.log(req.body);
        const { Email, Phone } = req.body;
        // phone checking
        const checkingUserPhoneExistAlready = await User.findOne({
            Phone: Phone,
        });
        if (checkingUserPhoneExistAlready) {
            throw new ApiError(409, 'Already used phone number.');
        }

        // email checking
        const checkingUserEmailExistAlready = await User.findOne({
            Email: Email,
        });

        if (checkingUserEmailExistAlready) {
            throw new ApiError(409, 'Already used email.');
        }

        const newUser = await User.create({ ...req.body });

        const createdUser = await User.findById(newUser._id);

        if (!createdUser) {
            throw new ApiError(500, 'Registration Fail !!');
        }

        sendTokenResponse(201, newUser, res, 'Registration Successfull !! 😎');
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            Error: err.message,
        });
    }
});

// login
const loginUser = asyncHandler(async (req, res) => {
    try {
        const { Phone, Password } = req.body;
        // console.log('login: req.body=> ', req.body);
        if (!Phone || !Password) {
            throw new ApiError(400, 'Phone or Password is missing!!');
        }
        const loggedUser = await User.findOne({ Phone: Phone });

        if (!loggedUser) {
            throw new ApiError(404, 'User is not registered !! -> ');
        }

        const isPasswordMatched = await loggedUser.checkPassword(Password);
        // const isPasswordMatched = (await loggedUser.Password) === Password;
        // console.log('pas val: ', isPasswordMatched);
        if (isPasswordMatched) {
            // console.log(loggedUser.Password);
            sendTokenResponse(200, loggedUser, res, 'Login Successfull !! 😎');
        } else {
            // console.log(loggedUser.Password, '\n\nuser: ', loggedUser);
            throw new ApiError(401, 'Password Invalid !! 😣');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            Error: err.message,
        });
    }
});

//  forgetPassword
const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { Phone } = req.body;

        const validUser = await User.findOne({ Phone: Phone });

        if (!validUser) {
            throw new ApiError(404, 'Email or Phone Number is not found !!');
        }

        // Reset password Token
        const OTP = await validUser.getResetPswdToken();

        // await validUser.save({ validateBeforeSave: false });

        const message = `Your OTP is : ${OTP} \n\n Please delete email after OTP is used and don't share to anybody this OTP. \n\n This OTP will expire after 2 mins.`;

        await sendEmail({
            email: validUser.Email,
            subject: 'AVIKARTA: Reset OTP',
            mailContent: message,
        });
        console.log(OTP);
        res.status(200).json({
            success: true,
            message: 'OTP is sent to your email successfully',
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

//  resetPassword
const resetPassword = asyncHandler(async (req, res) => {
    try {
        // console.log('reset password: ', req.body);
        const { Phone, OTP, newPassword } = req.body;

        const resetUser = await User.findOne({
            Phone: Phone,
        });

        console.log(
            'otp exiry dates: ',
            new Date(Date.now()),
            new Date(resetUser.resetPasswordExpire)
        );

        if (new Date(Date.now()) >= resetUser.resetPasswordExpire) {
            throw new ApiError(419, 'OTP is Expired !');
        }

        // save confirmed password
        console.log('OTPs: ', resetUser.OTP, OTP);
        if (resetUser.OTP === OTP) {
            const isChanged = await resetUser.changePassword(newPassword);
            if (isChanged) {
                res.status(200).json({
                    status: 200,
                    message: 'Reset Password Successfull !! 😎',
                });
            } else {
                throw new ApiError(500, 'Reseting Password Failed !! ');
            }
        } else {
            throw new ApiError(400, 'Wrong OTP !!');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// -------> required authenticated tokenization routes <---------

// logout
const logOut = asyncHandler(async (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            logStatus: 'checkout',
            message: req.user.FullName + ' is logged out successfully !!',
        });
    }
});

// updatePassword
const updatePassword = asyncHandler(async (req, res) => {
    try {
        // console.log("update pswd:: ", req.user, req.body);
        const user = await User.findOne(req.user._id).select('+Password');
        if (!user) {
            throw new ApiError(401, 'User is not verified !!');
        }

        const { oldPassword, newPassword } = req.body;
        const checkCurrentGivePswd = await user.checkPassword(oldPassword);
        if (!checkCurrentGivePswd) {
            throw new ApiError(400, 'Old Password is incorrect !!');
        }

        // update pswd with confirmPassword
        user.Password = newPassword;
        await user.save();

        res.status(200).json({
            statusCode: 200,
            message: 'Password Updated Successfully !! 😎',
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

//  getUserDetails
const getUserDetails = asyncHandler(async (req, res) => {
    try {
        // console.log('user dtail: ', req.user);
        const userDetail = await User.findById(
            new ObjectId(String(req.user._id))
        );
        if (!userDetail) {
            throw new ApiError(404, "Users' detail is not found !!");
        }

        res.status(200).json({
            statusCode: 200,
            user: userDetail,
            message: 'User Details !! 😎',
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// insertManyUser
const insertManyUser = asyncHandler(async (req, res) => {
    try {
        const manyUser = await User.insertMany(req.body)
            .then((response) => {
                if (response) {
                    res.status(200).json({
                        message: 'all user registered successfully ! 😜',
                    });
                }
            })
            .catch((err) => {
                throw new ApiError(409, 'Insery many failed with ' + err);
            });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// change Password
const changePassword = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session Expired !');
        }
        const { currentPassword, newPassword } = req.body;

        const dbUSER = await User.findById(req.user._id);

        // check current password
        const isPasswordVerified = await dbUSER.checkPassword(currentPassword);
        if (isPasswordVerified) {
            // changingPassword
            const isChanged = await dbUSER.changePassword(newPassword);
            if (isChanged) {
                res.status(200).json({
                    message: 'Password changed successfully !!',
                });
            }
        } else {
            throw new ApiError(403, 'Current Password is incorrect !!');
        }

        // change current pswd
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// update Profile
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session Expired !');
        }

        const updates = req.body;

        // Find the user by ID and update with the provided data
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw new ApiError(401, 'Unable to update profile !');
        }

        res.status(200).json({
            message: 'Profile updated successfully !',
            data: updatedUser,
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
};

export {
    registerUser,
    loginUser,
    logOut,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    changePassword,
    insertManyUser,
};
