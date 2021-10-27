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
exports.UpdateUserHandler = void 0;
const transactions_1 = require("@sotaoi/omni/transactions");
const update_handler_1 = require("@sotaoi/api/commands/update-handler");
const storage_1 = require("@sotaoi/api/storage");
const user_model_1 = require("@app/api/models/user-model");
class UpdateUserHandler extends update_handler_1.UpdateHandler {
    constructor() {
        super(...arguments);
        this.getFormId = () => __awaiter(this, void 0, void 0, function* () { return 'user-update-form'; });
    }
    model() {
        return __awaiter(this, void 0, void 0, function* () {
            return new user_model_1.UserModel();
        });
    }
    handle(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, name, avatar } = command.payload;
            const [saveAvatar, avatarAsset, removeAvatar] = storage_1.storage('main').handle({
                domain: 'public',
                pathname: ['user', command.uuid, 'avatar.png'].join('/'),
            }, avatar);
            const payload = {};
            typeof email !== 'undefined' && (payload.email = email.serialize(true));
            typeof name !== 'undefined' && (payload.name = name ? name.serialize(true) : '');
            typeof avatar !== 'undefined' && (payload.avatar = avatarAsset === null || avatarAsset === void 0 ? void 0 : avatarAsset.serialize(true));
            Object.keys(payload).length && (yield new user_model_1.UserModel().mdb().where('uuid', command.uuid).update(payload));
            typeof avatar !== 'undefined' && (avatar ? saveAvatar() : removeAvatar());
            return new transactions_1.CommandResult(200, null, 'Hello', 'Command test', this.mdriverArtifact('user', command.uuid, {}), null, {});
        });
    }
    refreshArtifact() {
        return true;
    }
}
exports.UpdateUserHandler = UpdateUserHandler;
