var util = {};
util.createApiError = function (code, msg) {
    var err = new Error(msg);
    err.error_code = code;
    err.error_message = msg;
    return err;
};

util.getClientIP = function (req) {
    var ipAddress;
    var headers = req.headers;
    var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
    forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
};


module.exports = util;
