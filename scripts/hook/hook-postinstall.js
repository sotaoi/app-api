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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const appOmniPath = path_1.default.dirname(require.resolve('@app/omni/package.json'));
    const pocketPath = fs_1.default.existsSync(path_1.default.resolve('../../pocket'))
        ? path_1.default.resolve('../pocket')
        : path_1.default.resolve('../pocket');
    if (!fs_1.default.existsSync(pocketPath)) {
        console.error('Pocket folder is missing');
        return;
    }
    fs_1.default.existsSync(path_1.default.resolve(pocketPath, 'env.json')) &&
        fs_1.default.copyFileSync(path_1.default.resolve(pocketPath, 'env.json'), path_1.default.resolve(appOmniPath, 'env.json'));
    fs_1.default.rmdirSync(path_1.default.resolve(appOmniPath, 'certs'), { recursive: true });
    fs_1.default.mkdirSync(path_1.default.resolve(appOmniPath, 'certs'));
    fs_1.default.existsSync(path_1.default.resolve(pocketPath, 'certs')) &&
        fs_1.default.readdirSync(path_1.default.resolve(pocketPath, 'certs')).map((item) => {
            const fullpath = path_1.default.resolve(pocketPath, 'certs', item);
            if (fs_1.default.lstatSync(fullpath).isDirectory() || item.charAt(0) === '.') {
                return;
            }
            fs_1.default.copyFileSync(fullpath, path_1.default.resolve(appOmniPath, 'certs', item));
        });
});
main();
