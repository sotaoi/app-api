#!/bin/env/node
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    fs_1.default.existsSync(path_1.default.resolve('./package-lock.json')) && fs_1.default.unlinkSync(path_1.default.resolve('./package-lock.json'));
    fs_1.default.rmdirSync(path_1.default.resolve('./node_modules'), { recursive: true });
    child_process_1.execSync('npm run bootstrap', { stdio: 'inherit' });
});
main();
