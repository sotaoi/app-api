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
const child_process_1 = require("child_process");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    child_process_1.exec('git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        const deployment = typeof stdout === 'string' ? stdout.trim() : null;
        if (!deployment || deployment === 'master' || deployment === 'tmp/deploy') {
            console.error('Failed, could not determine deployment branch, or branch is invalid...');
            return;
        }
        try {
            child_process_1.execSync('git branch -D tmp/deploy');
        }
        catch (err) {
            // do nothing
        }
        child_process_1.execSync('git checkout -b tmp/deploy', { stdio: 'inherit' });
        child_process_1.execSync('git checkout -- ./', { stdio: 'inherit' });
        try {
            child_process_1.execSync(`git branch -D ${deployment}`);
        }
        catch (err) {
            // do nothing
        }
        child_process_1.execSync('git fetch', { stdio: 'inherit' });
        child_process_1.execSync(`git checkout ${deployment}`, { stdio: 'inherit' });
        child_process_1.execSync('npm run bootstrap:prod', { stdio: 'inherit' });
        child_process_1.execSync('npm run restart:api:prod');
    });
});
main();
