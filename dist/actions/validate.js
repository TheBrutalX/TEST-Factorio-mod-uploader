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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const path_1 = __importDefault(require("path"));
const semver_1 = __importDefault(require("semver"));
const fs_1 = __importDefault(require("fs"));
const FactorioModPortalApiService_1 = __importDefault(require("../services/FactorioModPortalApiService"));
class ValidateProcess {
    constructor() {
        this.modPath = '';
    }
    parseInputs() {
        this.modPath = core.getInput('MOD-DIR', { required: false });
        if (!this.modPath)
            this.modPath = process.cwd();
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const infoPath = path_1.default.join(this.modPath, 'info.json');
            if (!fs_1.default.existsSync(infoPath))
                throw new Error('info.json not found');
            const info = require(infoPath);
            if (!info.name)
                throw new Error('Missing mod name in info.json');
            if (!info.version)
                throw new Error('Missing mod version in info.json');
            // Check mod name lenght
            if (info.name.length < 3)
                throw new Error('Mod name is too short');
            if (info.name.length > 100)
                throw new Error('Mod name is too long');
            // Check if the mod name is a valid mod name
            if (!/^[a-z0-9_-]+$/i.test(info.name))
                throw new Error('Invalid mod name in info.json');
            // Check if the mod version is a valid semver version
            if (!this.isValidVersion(info.version))
                throw new Error('Invalid version in info.json');
            core.info(`Mod name: ${info.name}`);
            core.info(`Mod version: ${info.version}`);
            core.debug('info.json is valid');
            if (!(yield this.checkOnlineVersion(info.name, info.version)))
                throw new Error('Mod already exists on the mod portal with the same version');
            core.exportVariable('MOD_NAME', info.name);
            core.exportVariable('MOD_VERSION', info.version);
            core.exportVariable('MOD-DIR', this.modPath);
        });
    }
    checkOnlineVersion(name, version) {
        return __awaiter(this, void 0, void 0, function* () {
            const latestVersion = yield FactorioModPortalApiService_1.default.getLatestModVersion(name);
            return semver_1.default.gt(version, latestVersion);
        });
    }
    isValidVersion(version) {
        // Check if the version is a valid semver version
        return semver_1.default.valid(version) !== null;
    }
}
exports.default = ValidateProcess;
