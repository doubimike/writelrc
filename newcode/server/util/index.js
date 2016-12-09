var util = {};
util.createApiError = function (code, msg) {
    var err = new Error(msg);
    err.error_code = code;
    err.error_message = msg;
    return err;
};

module.exports = util;
