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
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield main_1.main(true);
        const rollbacks = (yield db_1.rollback())[1];
        !rollbacks.length && (rollbacks[0] = 'No rollbacks');
        logger_1.logger().info(`\n\nRollback complete:\n${rollbacks.join('\n')}\n`);
        process.exit(0);
    }
    catch (err) {
        logger_1.logger().estack(err);
        process.exit(1);
    }
});
run();
