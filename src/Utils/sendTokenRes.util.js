const sendTokenResponse = async (statusCode, user, res, message) => {
    const Token = await user.generateAccessToken();
    // options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.ACCESS_TOKEN_EXPIRY * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: true,
    };
    const userDetail = {
        _id: user._id,
        FullName: user.FullName,
        Phone: user.Phone,
        Email: user.Email,
    };

    // res with cookies
    res.status(statusCode).cookie('Token', Token, options).json({
        success: true,
        message: message,
        userDetail,
        Token,
    });
};

export default sendTokenResponse;
