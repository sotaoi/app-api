"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrieveUserHandler = void 0;
const retrieve_handler_1 = require("@sotaoi/api/queries/retrieve-handler");
const transactions_1 = require("@sotaoi/omni/transactions");
const user_model_1 = require("@app/api/models/user-model");
const logger_1 = require("@sotaoi/api/logger");
const errors_1 = require("@app/api/errors/errors");
const errors_2 = require("@sotaoi/omni/errors");
class RetrieveUserHandler extends retrieve_handler_1.RetrieveHandler {
    model() {
        return __awaiter(this, void 0, void 0, function* () {
            return new user_model_1.UserModel();
        });
    }
    handle(retrieve) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!(yield this.requireArtifact(retrieve.authRecord).ofType('user'))) {
                    return new transactions_1.RetrieveResult(401, errors_2.ErrorCode.APP_GENERIC_ERROR, 'Unauthorized', 'No authorization to run query', null, null, {});
                }
                const user = yield new user_model_1.UserModel().mdb().where('uuid', retrieve.uuid).first();
                if (!user) {
                    const error = new errors_1.NotFoundError('Retrieve failed');
                    error.message = 'Not found';
                    throw error;
                }
                const result = new transactions_1.RetrieveResult(200, null, 'Retrieve success', 'Retrieve was successful', yield this.transform(user, retrieve.variant), null, {});
                return result;
            }
            catch (err) {
                logger_1.logger().estack(err);
                return new transactions_1.RetrieveResult(err && err.code ? err.code : 400, errors_2.ErrorCode.APP_GENERIC_ERROR, err && err.name ? err.name : 'Error', err && err.message ? err.message : 'Retrieve failed', null, null, {});
            }
        });
    }
}
exports.RetrieveUserHandler = RetrieveUserHandler;
