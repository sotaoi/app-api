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
exports.AuthUserHandler = void 0;
const transactions_1 = require("@sotaoi/omni/transactions");
const auth_handler_1 = require("@sotaoi/api/commands/auth-handler");
const helper_1 = require("@sotaoi/api/helper");
const user_model_1 = require("@app/api/models/user-model");
const oauth_authorize_1 = require("@sotaoi/api/auth/oauth-authorize");
const errors_1 = require("@sotaoi/omni/errors");
class AuthUserHandler extends auth_handler_1.AuthHandler {
    constructor() {
        super(...arguments);
        this.getFormId = () => __awaiter(this, void 0, void 0, function* () { return 'auth-user-form'; });
    }
    model() {
        return __awaiter(this, void 0, void 0, function* () {
            return new user_model_1.UserModel();
        });
    }
    handle(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield new user_model_1.UserModel()
                .mdb()
                .where('email', command.payload.email.serialize(true))
                .where('password', helper_1.Helper.sha1(command.payload.password.serialize(true)))
                .first();
            if (!user) {
                return new transactions_1.AuthResult(401, errors_1.ErrorCode.APP_GENERIC_ERROR, 'Error', 'Invalid credentials', null, null, null, {});
            }
            const accessToken = helper_1.Helper.uuid();
            // todo lowprio: better token encryption needed here
            const authRecord = this.mdriverAuthRecord('user', user.uuid, user.createdAt, true, {});
            const rememberMe = command.payload.rememberMe.serialize(true);
            const tokenTtl = rememberMe ? auth_handler_1.AuthHandler.getTokenTtlInSeconds() : auth_handler_1.AuthHandler.getShortTokenTtlInSeconds();
            if (!(yield oauth_authorize_1.storeAuthorization('user', this.handler, authRecord, this.mdriverDomainRepoSignature('user'), accessToken, rememberMe, tokenTtl))) {
                return new transactions_1.AuthResult(400, errors_1.ErrorCode.APP_GENERIC_ERROR, 'Error', 'Credentials look good, but authorization server failed', authRecord, accessToken, null, {});
            }
            return new transactions_1.AuthResult(200, null, 'Success', 'Authentication success', authRecord, accessToken, null, {});
        });
    }
}
exports.AuthUserHandler = AuthUserHandler;
