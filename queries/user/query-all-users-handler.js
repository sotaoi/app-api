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
exports.QueryAllUsersHandler = void 0;
const query_handlers_1 = require("@sotaoi/api/queries/query-handlers");
const transactions_1 = require("@sotaoi/omni/transactions");
const user_model_1 = require("@app/api/models/user-model");
const logger_1 = require("@sotaoi/api/logger");
const errors_1 = require("@sotaoi/omni/errors");
class QueryAllUsersHandler extends query_handlers_1.FlistQueryHandler {
    model() {
        return __awaiter(this, void 0, void 0, function* () {
            return new user_model_1.UserModel();
        });
    }
    handle(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.requireArtifact(query.authRecord).ofType('user'))) {
                return new transactions_1.QueryResult(401, errors_1.ErrorCode.APP_GENERIC_ERROR, 'Unauthorized', 'No authorization to run query', null, null, {});
            }
            try {
                const users = yield new user_model_1.UserModel().mdb().orderBy('createdAt', 'DESC');
                return new transactions_1.QueryResult(200, null, 'Query success', 'Query was successful', yield this.transform(users, null), null, {});
            }
            catch (err) {
                logger_1.logger().estack(err);
                return new transactions_1.QueryResult(400, errors_1.ErrorCode.APP_GENERIC_ERROR, 'Error', 'Query failed', null, null, {});
            }
        });
    }
}
exports.QueryAllUsersHandler = QueryAllUsersHandler;
