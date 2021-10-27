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
exports.ApiInit = void 0;
const app_kernel_1 = require("@sotaoi/api/app-kernel");
const config_1 = require("@app/omni/config");
const output_1 = require("@sotaoi/api/output");
const string_input_1 = require("@sotaoi/omni/input/string-input");
const number_input_1 = require("@sotaoi/omni/input/number-input");
const ref_select_input_1 = require("@sotaoi/omni/input/ref-select-input");
const file_input_1 = require("@sotaoi/omni/input/file-input");
const multi_file_input_1 = require("@sotaoi/omni/input/multi-file-input");
const string_select_input_1 = require("@sotaoi/omni/input/string-select-input");
const options_select_input_1 = require("@sotaoi/omni/input/options-select-input");
const boolean_input_1 = require("@sotaoi/omni/input/boolean-input");
const artifacts_1 = require("@sotaoi/omni/artifacts");
const auth_handler_1 = require("@sotaoi/api/commands/auth-handler");
const generic_model_1 = require("@sotaoi/api/db/generic-model");
const store_1 = require("@sotaoi/api/store");
const oauth_authorize_1 = require("@sotaoi/api/auth/oauth-authorize");
class ApiInit {
    // app kernel
    static kernel() {
        if (!ApiInit._kernel) {
            ApiInit._kernel = new app_kernel_1.AppKernel().bootstrap(config_1.config);
        }
        return ApiInit._kernel;
    }
    // for automatic payload deserialization
    static registerInputs() {
        output_1.Output.registerInput(string_input_1.StringInput);
        output_1.Output.registerInput(number_input_1.NumberInput);
        output_1.Output.registerInput(file_input_1.FileInput);
        output_1.Output.registerInput(multi_file_input_1.MultiFileInput);
        output_1.Output.registerInput(ref_select_input_1.RefSelectInput);
        output_1.Output.registerInput(string_select_input_1.StringSelectInput);
        output_1.Output.registerInput(options_select_input_1.OptionsSelectInput);
        output_1.Output.registerInput(boolean_input_1.BooleanInput);
    }
    // set auth handler token ttl in milliseconds
    static setTokenTtlInMilliseconds(tokenTtl, shortTokenTtl) {
        auth_handler_1.AuthHandler.setTokenTtlInMilliseconds(tokenTtl);
        auth_handler_1.AuthHandler.setShortTokenTtlInMilliseconds(shortTokenTtl);
    }
    // translate access token
    static translateAccessToken(handler, accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessTokenInState = auth_handler_1.AuthHandler.getAccessToken(handler);
            if (!accessToken || typeof accessToken !== 'string' || accessTokenInState !== accessToken) {
                return [null, null];
            }
            const accessTokenRecord = yield new generic_model_1.GenericModel('access_token')
                .mdb()
                .where('token', accessToken)
                .where('expiresAt', '>', new Date())
                .first();
            if (!accessTokenRecord) {
                return [null, null];
            }
            const authRecord = artifacts_1.AuthRecord.deserialize(accessTokenRecord.authRecordSerial);
            console.log('>>', authRecord.domainSignature, store_1.Store.mdriverDomainSignature());
            if (authRecord.domainSignature !== store_1.Store.mdriverDomainSignature()) {
                return [null, null];
            }
            console.log('<<');
            const record = yield new generic_model_1.GenericModel(authRecord.repository).mdb().where('uuid', authRecord.uuid).first();
            if (!record) {
                return [null, null];
            }
            console.log('<<');
            const oauthAccessToken = yield oauth_authorize_1.obtainUserToken('user', store_1.Store.mdriverDomainRepoSignature('user'), authRecord.uuid, '@#');
            console.log('<<');
            if (!oauthAccessToken) {
                return [null, null];
            }
            console.log('<<');
            if (!(yield oauth_authorize_1.verifyToken(oauthAccessToken, '@#'))) {
                return [null, null];
            }
            console.log('<<');
            return [
                new artifacts_1.AuthRecord(authRecord.domainSignature, authRecord.repository, record.uuid, record.createdAt, true, {}),
                accessToken,
            ];
        });
    }
    // deauth
    static deauth(handler) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = auth_handler_1.AuthHandler.getAccessToken(handler);
            if (accessToken) {
                yield new generic_model_1.GenericModel('access_token').mdb().where('token', accessToken).delete();
            }
            auth_handler_1.AuthHandler.removeAccessToken(handler);
        });
    }
}
exports.ApiInit = ApiInit;
// { -->
ApiInit._kernel = null;
