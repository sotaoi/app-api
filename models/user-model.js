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
exports.UserModel = void 0;
const model_1 = require("@sotaoi/api/db/model");
class UserModel extends model_1.Model {
    hidden() {
        return ['password'];
    }
    schema() {
        return {
            uuid: {
                type: String,
                index: {
                    unique: true,
                },
            },
            email: {
                type: String,
            },
            name: {
                type: String,
            },
            password: {
                type: String,
            },
            avatar: {
                type: String,
            },
            gallery: {
                type: String,
            },
            address: {
                type: String,
            },
            createdAt: {
                type: Date,
            },
            updatedAt: {
                type: Date,
            },
        };
    }
    repository() {
        return 'user';
    }
    view(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.with(user, 'address:view');
            return user;
        });
    }
}
exports.UserModel = UserModel;
