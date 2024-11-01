"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const zipper_1 = require("../utils/zipper");
const promises_1 = require("fs/promises");
const path_1 = require("path");
class CompressProcess {
    constructor() {
        this.modName = '';
        this.modPath = '';
        this.modVersion = '';
        this.tmpPath = '';
    }
    parseInputs() {
        this.modName = core.getInput('MOD_NAME', { required: true });
        this.modPath = core.getInput('MOD-DIR', { required: true });
        this.modVersion = core.getInput('MOD_VERSION', { required: true });
        this.tmpPath = process.env.RUNNER_TEMP || '';
        if (!this.tmpPath)
            throw new Error('RUNNER_TEMP is required');
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const zipName = this.normalizedZipName();
            core.info(`Creating zip file: ${zipName}`);
            const zipDir = (0, path_1.join)(this.tmpPath, 'zip');
            const modDir = (0, path_1.join)(zipDir, this.modName);
            yield (0, promises_1.mkdir)(modDir, { recursive: true });
            yield (0, promises_1.cp)(this.modPath, modDir, { recursive: true });
            const zipPath = `${this.tmpPath}/${zipName}`;
            const absolutePath = yield (0, zipper_1.zipDirectory)(zipDir, zipPath);
            (0, promises_1.rm)(zipDir, { recursive: true });
            core.info(`Zip file created: ${absolutePath}`);
            core.exportVariable('ZIP_PATH', absolutePath);
        });
    }
    normalizedZipName() {
        const modName = this.modName.replace(/[^a-z0-9_-]/gi, '-');
        return `${modName}_${this.modVersion}.zip`;
    }
}
exports.default = CompressProcess;
