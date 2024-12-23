const asyncHandler = (requestHandler) => {
    try {
        // console.log("-->R: asyncHandler utils portal....... \n");
        return (req, res, next) => {
            Promise.resolve(requestHandler(req, res, next)).catch(next);
        };
        
    } catch (error) {
        console.log("-->E: aysncHandler", error);
    }
};

export default asyncHandler;
