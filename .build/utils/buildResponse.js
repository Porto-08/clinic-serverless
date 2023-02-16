"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResponse = void 0;
var buildResponse = function (statusCode, body) {
    return {
        statusCode: statusCode,
        body: JSON.stringify(body, null, 2),
    };
};
exports.buildResponse = buildResponse;
//# sourceMappingURL=buildResponse.js.map