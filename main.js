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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const init_1 = require("@app/omni/init");
init_1.init();
process.env.SIGNATURE_1 = process.env.DB_NAME;
process.env.SIGNATURE_2 = process.env.DB_CONTROL_PANEL_NAME;
init_1.init();
const fs_1 = __importDefault(require("fs"));
const store_1 = require("@sotaoi/api/store");
const server_1 = require("@sotaoi/api/server");
const handlers_1 = require("@app/api/handlers");
const user_forms_1 = require("@app/omni/forms/user-forms");
const api_init_1 = require("@app/api/api-init");
const user_model_1 = require("@app/api/models/user-model");
const db_1 = require("@sotaoi/api/db");
const logger_1 = require("@sotaoi/api/logger");
const auth_handler_1 = require("@sotaoi/api/commands/auth-handler");
const get_app_info_1 = require("@sotaoi/omni/get-app-info");
const oauth_authorize_1 = require("@sotaoi/api/auth/oauth-authorize");
const config_1 = require("@app/omni/config");
let server = null;
let serverInitInterval = null;
let serverInitTries = 0;
const main = (noServer) => __awaiter(void 0, void 0, void 0, function* () {
    clearTimeout(serverInitInterval);
    const appInfo = get_app_info_1.getAppInfo();
    const keyPath = require.resolve(appInfo.sslKey);
    const certPath = require.resolve(appInfo.sslCert);
    const chainPath = require.resolve(appInfo.sslCa);
    if (!noServer && (!fs_1.default.existsSync(keyPath) || !fs_1.default.existsSync(certPath) || !fs_1.default.existsSync(chainPath))) {
        if (serverInitTries === 60) {
            console.error('server failed to start because at least one ssl certificate file is missing');
            return;
        }
        serverInitTries++;
        console.warn('at least one certificate file is missing. retrying in 5 seconds...');
        serverInitInterval = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            yield main(false);
        }), 5000);
        return;
    }
    // app kernel
    const appKernel = api_init_1.ApiInit.kernel();
    // for automatic payload deserialization
    api_init_1.ApiInit.registerInputs();
    // set token ttl in milliseconds
    api_init_1.ApiInit.setTokenTtlInMilliseconds(14 * 24 * 60 * 60 * 1000, 0.5 * 24 * 60 * 60 * 1000);
    // models
    const models = [new user_model_1.UserModel()];
    models.map((model) => logger_1.logger().notice(`Acknowledging model ${model.repository()}`));
    yield db_1.connect();
    yield db_1.mconnect();
    yield db_1.sconnect();
    appKernel.bootstrap(config_1.config);
    auth_handler_1.AuthHandler.setTranslateAccessToken(api_init_1.ApiInit.translateAccessToken);
    auth_handler_1.AuthHandler.setDeauth(api_init_1.ApiInit.deauth);
    yield store_1.Store.init(appInfo, handlers_1.handlers, { user: user_forms_1.user }, oauth_authorize_1.scopedRequests());
    // start
    !noServer &&
        (server = yield server_1.Server.init(noServer, { key: keyPath, ca: chainPath, cert: certPath, rejectUnauthorized: false }));
});
exports.main = main;
