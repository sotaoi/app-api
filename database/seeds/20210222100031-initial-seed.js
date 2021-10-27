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
exports.seed = void 0;
const user_model_1 = require("@app/api/models/user-model");
const model_1 = require("@sotaoi/api/db/model");
const helper_1 = require("@sotaoi/api/helper");
const oauth_tables_1 = require("@sotaoi/api/db/oauth-tables");
const config_1 = require("@app/omni/config");
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    const user = new user_model_1.UserModel().mdb();
    const email = 'asd@asd.com';
    if (!(yield user.where('email', email).first())) {
        yield user.insert({
            uuid: helper_1.Helper.uuid(),
            email,
            password: helper_1.Helper.sha1('asdasd'),
            name: 'Asd Com',
            avatar: null,
        });
    }
    yield oauth_tables_1.seedOauthTables(model_1.Model.mdriver(), config_1.config('app.oauth_port'));
    // const user = new UserModel();
    // await user.db().deleteMany({});
    // await user.db().insertMany({
    //   uuid: Helper.uuid(),
    //   email: 'asd@asd.com',
    //   password: 'asdasd',
    //   name: 'Asd Com',
    //   avatar: null,
    // });
});
exports.seed = seed;
