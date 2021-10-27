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
exports.down = exports.up = void 0;
const access_token_table_1 = require("@sotaoi/api/db/access_token-table");
const up = (dbConnection) => __awaiter(void 0, void 0, void 0, function* () {
    yield access_token_table_1.migrateAccessTokenTable(dbConnection);
});
exports.up = up;
const down = (dbConnection) => __awaiter(void 0, void 0, void 0, function* () {
    yield access_token_table_1.rollbackAccessTokenTable(dbConnection);
});
exports.down = down;
