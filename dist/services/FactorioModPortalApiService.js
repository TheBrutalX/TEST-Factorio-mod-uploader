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
const axios_1 = __importStar(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = require("fs");
const path_1 = require("path");
const modApiUrl = 'https://mods.factorio.com/api';
const axiosInstance = axios_1.default.create({
    timeout: 1000,
});
class FactorioModPortalApiService {
    static getLatestModVersion(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${modApiUrl}/mods/${name}`;
                const response = yield axiosInstance.get(url);
                const modInfo = response.data;
                if (modInfo.releases && modInfo.releases.length > 0) {
                    const latestRelease = modInfo.releases.reduce((latest, release) => {
                        return new Date(release.released_at) >
                            new Date(latest.released_at)
                            ? release
                            : latest;
                    }, modInfo.releases[0]);
                    return latestRelease.version;
                }
                else {
                    throw new Error('No releases found for the mod.');
                }
            }
            catch (error) {
                throw new Error(`Error fetching mod info: ${error}`);
            }
        });
    }
    static ModUploadInit(token, modName) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const url = `${modApiUrl}v2/mods/releases/init_upload`;
            const formData = new form_data_1.default();
            formData.append('mod', modName);
            try {
                const response = yield axios_1.default.post(url, formData, {
                    headers: Object.assign({ Authorization: `Bearer ${token}` }, formData.getHeaders()),
                });
                return response.data.upload_url;
            }
            catch (e) {
                if (e instanceof axios_1.AxiosError) {
                    if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 401)
                        throw new Error('Invalid API token');
                    if (((_b = e.response) === null || _b === void 0 ? void 0 : _b.status) === 403)
                        throw new Error('The API token does not have permission to upload mods');
                    if (((_c = e.response) === null || _c === void 0 ? void 0 : _c.status) === 404) {
                        if (e.response.data.error === 'UnknownMod') {
                            throw new Error(`The mod ${modName} does not exist on the mod portal, please create it first`);
                        }
                        else {
                            throw e;
                        }
                    }
                }
                throw e;
            }
        });
    }
    static ModUploadFinish(token, upload_url, modZipPath) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const formData = new form_data_1.default();
            const uploadFormData = new form_data_1.default();
            const fileData = (0, fs_1.createReadStream)(modZipPath);
            const fileName = (0, path_1.basename)(modZipPath);
            uploadFormData.append('file', fileData, fileName);
            try {
                const response = yield axios_1.default.post(upload_url, uploadFormData, {
                    headers: Object.assign({ Authorization: `Bearer ${token}` }, uploadFormData.getHeaders()),
                });
                if (response.data.success !== true) {
                    throw new Error(`Failed to upload mod: ${response.data.message}`);
                }
            }
            catch (e) {
                if (e instanceof axios_1.AxiosError) {
                    if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 401)
                        throw new Error('Invalid API token');
                    if (((_b = e.response) === null || _b === void 0 ? void 0 : _b.status) === 403)
                        throw new Error('The API token does not have permission to upload mods');
                    if (((_c = e.response) === null || _c === void 0 ? void 0 : _c.status) === 400)
                        throw new Error('The mod file is invalid or equal to an existing release');
                    throw new Error(e.message);
                }
                throw e;
            }
        });
    }
}
exports.default = FactorioModPortalApiService;
//#endregion
