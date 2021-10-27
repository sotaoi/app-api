#!/bin/env node
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
const main_1 = require("@app/api/main");
const db_1 = require("@sotaoi/api/db");
const logger_1 = require("@sotaoi/api/logger");
const get_app_info_1 = require("@sotaoi/omni/get-app-info");
const cpanel_tables_1 = require("@sotaoi/api/db/cpanel-tables");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield main_1.main(true);
        logger_1.logger().info(`Running app seeds...\n`);
        const seeds = (yield db_1.seed())[0];
        !seeds.length && (seeds[0] = 'No seed files');
        logger_1.logger().info(`\n\nSeeding complete:\n${seeds.join('\n')}\n`);
        logger_1.logger().info(`Running control panel seeds...\n`);
        yield cpanel_tables_1.cpanelSeed(get_app_info_1.getAppInfo().isMasterBundle === 'yes');
        process.exit(0);
    }
    catch (err) {
        logger_1.logger().estack(err);
        process.exit(1);
    }
});
run();
