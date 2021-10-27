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
exports.buildAapiRoutine = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const helper_1 = require("@sotaoi/omni/helper");
const child_process_1 = require("child_process");
const buildAapiRoutine = (deploy) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof deploy !== 'boolean') {
        throw new Error('Bad deployment flag');
    }
    //
    fs_1.default.rmdirSync(path_1.default.resolve('./deployment'), { recursive: true });
    fs_1.default.rmdirSync(path_1.default.resolve('./tmp.deployment'), { recursive: true });
    fs_1.default.mkdirSync(path_1.default.resolve('./deployment'));
    fs_1.default.writeFileSync(path_1.default.resolve('./deployment/.gitkeep'), '');
    const packageJson = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve('./package.json')).toString());
    deploy && fs_1.default.mkdirSync(path_1.default.resolve('./tmp.deployment'));
    deploy &&
        child_process_1.execSync(`git clone git@github.com:sotaoi/app-api . && git checkout -b ${packageJson.version}`, {
            cwd: path_1.default.resolve('./tmp.deployment'),
            stdio: 'inherit',
        });
    helper_1.Helper.copyRecursiveSync(fs_1.default, path_1.default, path_1.default.resolve('./'), path_1.default.resolve('./deployment'), [
        path_1.default.resolve('.git'),
        path_1.default.resolve('./deployment'),
        path_1.default.resolve('./certs'),
        path_1.default.resolve('./node_modules'),
        path_1.default.resolve('./tmp.deployment'),
    ]);
    delete packageJson.devDependencies;
    fs_1.default.writeFileSync(path_1.default.resolve('./deployment/package.json'), JSON.stringify(packageJson, null, 2));
    child_process_1.execSync('npx tsc', { cwd: path_1.default.resolve('./deployment'), stdio: 'inherit' });
    fs_1.default.unlinkSync(path_1.default.resolve('./deployment/tsconfig.json'));
    child_process_1.execSync('npm run bootstrap:prod', { cwd: path_1.default.resolve('./deployment'), stdio: 'inherit' });
    helper_1.Helper.iterateRecursiveSync(fs_1.default, path_1.default, path_1.default.resolve('./deployment'), (item) => {
        if (fs_1.default.lstatSync(item).isDirectory()) {
            return;
        }
        item = path_1.default.resolve(item);
        if (item.substr(-3) === '.ts' && item.substr(-5) !== '.d.ts') {
            const filename = item.substr(0, item.length - 3);
            fs_1.default.existsSync(`${filename}.ts`) &&
                fs_1.default.lstatSync(`${filename}.ts`).isFile() &&
                fs_1.default.existsSync(`${filename}.js`) &&
                fs_1.default.lstatSync(`${filename}.js`).isFile() &&
                fs_1.default.existsSync(`${filename}.d.ts`) &&
                fs_1.default.lstatSync(`${filename}.d.ts`).isFile() &&
                fs_1.default.unlinkSync(item);
        }
        item.substr(-4) === '.tsx' && fs_1.default.unlinkSync(item);
    }, [path_1.default.resolve('./deployment/node_modules')]);
    deploy && fs_1.default.renameSync(path_1.default.resolve('./tmp.deployment/.git'), path_1.default.resolve('./deployment/.git'));
    deploy && fs_1.default.rmdirSync(path_1.default.resolve('./tmp.deployment'), { recursive: true });
    deploy &&
        (() => {
            try {
                child_process_1.execSync(`git add --all && git commit -m "release ${packageJson.version}" && git push -f -u origin ${packageJson.version}`, {
                    cwd: path_1.default.resolve('./deployment'),
                    stdio: 'inherit',
                });
            }
            catch (err) {
                // do nothing
                false && console.error(err);
            }
        })();
    deploy && fs_1.default.rmdirSync(path_1.default.resolve('./deployment/.git'), { recursive: true });
    fs_1.default.copyFileSync(path_1.default.resolve('../pocket/env.json'), path_1.default.resolve('./deployment/node_modules/@app/omni/env.json'));
    helper_1.Helper.copyRecursiveSync(fs_1.default, path_1.default, path_1.default.resolve('../pocket/certs'), path_1.default.resolve('./deployment/node_modules/@app/omni/certs'));
    //
});
exports.buildAapiRoutine = buildAapiRoutine;
