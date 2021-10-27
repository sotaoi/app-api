"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
class NotFoundError extends Error {
    constructor() {
        super(...arguments);
        this.code = 404;
    }
}
exports.NotFoundError = NotFoundError;
