
export const sendResponse = (res,statusCode,success,message,data = null) => {
    const response = {
        success,
        message,
        ...(data && {data}),
    };

    res.status(statusCode).json(response);
}