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
const _1 = require(".");
const token = process.env.TOKEN;
function ToInputEnv(key, value) {
    process.env['INPUT_' + key] = value;
}
function fullTest() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield validate()))
            return;
        if (!(yield compress()))
            return;
        if (!(yield upload()))
            return;
    });
}
function validate() {
    return __awaiter(this, void 0, void 0, function* () {
        process.env['GITHUB_ENV'] = '';
        process.env['RUNNER_TEMP'] = './tmp';
        console.log('Validate');
        process.env['INPUT_ACTION'] = 'validate';
        ToInputEnv('MOD-DIR', 'D:\\TFS\\factorio-mod-uploader-action\\tbx-test-upload');
        ToInputEnv('ACTION', 'validate');
        console.log('=====================');
        const r = yield (0, _1.run)();
        console.log('---------------------');
        console.log('Mod name : ' + process.env.MOD_NAME);
        console.log('Mod version: ' + process.env.MOD_VERSION);
        console.log('Mod path: ' + process.env.MOD_DIR);
        console.log('=====================');
        return r;
    });
}
function compress() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Create zip');
        ToInputEnv('MOD-DIR', process.env.MOD_DIR);
        ToInputEnv('MOD_NAME', process.env.MOD_NAME);
        ToInputEnv('MOD_VERSION', process.env.MOD_VERSION);
        ToInputEnv('ACTION', 'compress');
        console.log('=====================');
        const r = yield (0, _1.run)();
        console.log('---------------------');
        console.log('Zip path: ' + process.env.ZIP_PATH);
        console.log('=====================');
        return r;
    });
}
function upload() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Upload');
        ToInputEnv('MOD_NAME', process.env.MOD_NAME);
        ToInputEnv('ZIP_PATH', process.env.ZIP_PATH);
        ToInputEnv('API_TOKEN', token);
        ToInputEnv('ACTION', 'upload');
        console.log('=====================');
        const r = yield (0, _1.run)();
        console.log('=====================');
        return r;
    });
}
fullTest();
