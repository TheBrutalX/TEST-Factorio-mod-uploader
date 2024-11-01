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
const fs_1 = require("fs");
const FactorioModPortalApiService_1 = __importDefault(require("../services/FactorioModPortalApiService"));
class UploadProcess {
    constructor() {
        this.modName = '';
        this.modZipPath = '';
        this.modApiToken = '';
    }
    parseInputs() {
        this.modName = core.getInput('MOD_NAME', { required: true });
        this.modZipPath = core.getInput('ZIP_PATH', { required: true });
        this.modApiToken = core.getInput('API_TOKEN', { required: true });
        if ((0, fs_1.existsSync)(this.modZipPath) === false) {
            throw new Error(`File not found: ${this.modZipPath}`);
        }
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            // Upload mod
            core.info(`Uploading mod: ${this.modName}`);
            const uploadUrl = yield this.getUploadUrl();
            yield this.uploadMod(uploadUrl);
        });
    }
    getUploadUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield FactorioModPortalApiService_1.default.ModUploadInit(this.modApiToken, this.modName);
        });
    }
    uploadMod(upload_url) {
        return __awaiter(this, void 0, void 0, function* () {
            FactorioModPortalApiService_1.default.ModUploadFinish(this.modApiToken, upload_url, this.modZipPath);
            core.info('Mod uploaded successfully');
        });
    }
    convertFormDataToBuffer(formData) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const buffers = new Array();
                formData.on('data', (chunk) => buffers.push(chunk));
                formData.on('end', () => resolve(Buffer.concat(buffers)));
                formData.on('error', (err) => reject(err));
            });
        });
    }
}
exports.default = UploadProcess;
