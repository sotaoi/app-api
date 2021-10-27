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
exports.RegisterUserHandler = void 0;
const store_handler_1 = require("@sotaoi/api/commands/store-handler");
const transactions_1 = require("@sotaoi/omni/transactions");
const helper_1 = require("@sotaoi/api/helper");
const storage_1 = require("@sotaoi/api/storage");
const user_model_1 = require("@app/api/models/user-model");
const auth_handler_1 = require("@sotaoi/api/commands/auth-handler");
const oauth_authorize_1 = require("@sotaoi/api/auth/oauth-authorize");
const errors_1 = require("@sotaoi/omni/errors");
class RegisterUserHandler extends store_handler_1.StoreHandler {
    constructor() {
        super(...arguments);
        this.getFormId = () => __awaiter(this, void 0, void 0, function* () { return 'user-register-form'; });
    }
    model() {
        return __awaiter(this, void 0, void 0, function* () {
            return new user_model_1.UserModel();
        });
    }
    handle(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, name, avatar } = command.payload;
            const userUuid = helper_1.Helper.uuid();
            const [saveAvatar, avatarAsset, cancelAvatar] = storage_1.storage('main').handle({ domain: 'public', pathname: ['user', userUuid, 'avatar.png'].join('/') }, avatar);
            yield new user_model_1.UserModel().mdb().insert({
                uuid: userUuid,
                email: email.serialize(true),
                password: helper_1.Helper.sha1(password.serialize(true)),
                name: name ? name.serialize(true) : '',
                avatar: avatarAsset.serialize(true),
            });
            saveAvatar();
            const accessToken = helper_1.Helper.uuid();
            const user = yield new user_model_1.UserModel().mdb().where('uuid', userUuid).first();
            const authRecord = this.mdriverAuthRecord('user', userUuid, user.createdAt, true, { accessToken });
            const tokenTtl = auth_handler_1.AuthHandler.getTokenTtlInSeconds();
            if (!(yield oauth_authorize_1.storeAuthorization('user', this.handler, authRecord, this.mdriverDomainRepoSignature('user'), accessToken, true, tokenTtl))) {
                return new transactions_1.CommandResult(400, errors_1.ErrorCode.APP_GENERIC_ERROR, 'Error', 'User registered, but authentication failed', null, null, {});
            }
            return new transactions_1.CommandResult(200, null, 'Hello', 'You are authenticated', authRecord, null, {});
        });
    }
}
exports.RegisterUserHandler = RegisterUserHandler;
