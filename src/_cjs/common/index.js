"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAYS_PER_YEAR = exports.SECONDS_PER_DAY = exports.HttpRequestError = exports.BaseError = exports.Amount = void 0;
var amount_js_1 = require("./amount.js");
Object.defineProperty(exports, "Amount", { enumerable: true, get: function () { return amount_js_1.Amount; } });
var error_js_1 = require("./error.js");
Object.defineProperty(exports, "BaseError", { enumerable: true, get: function () { return error_js_1.BaseError; } });
Object.defineProperty(exports, "HttpRequestError", { enumerable: true, get: function () { return error_js_1.HttpRequestError; } });
exports.SECONDS_PER_DAY = 86400;
exports.DAYS_PER_YEAR = 365;
//# sourceMappingURL=index.js.map