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
exports.RemoveUserHandler = void 0;
const remove_handler_1 = require("@sotaoi/api/commands/remove-handler");
const transactions_1 = require("@sotaoi/omni/transactions");
const user_model_1 = require("@app/api/models/user-model");
class RemoveUserHandler extends remove_handler_1.RemoveHandler {
    model() {
        return __awaiter(this, void 0, void 0, function* () {
            return new user_model_1.UserModel();
        });
    }
    handle(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.model();
            yield user.mdb().where('uuid', command.uuid).delete();
            return new transactions_1.CommandResult(200, null, 'Removal success', 'Removal succeeded', this.mdriverArtifact('user', command.uuid, {}), null, {});
        });
    }
}
exports.RemoveUserHandler = RemoveUserHandler;
