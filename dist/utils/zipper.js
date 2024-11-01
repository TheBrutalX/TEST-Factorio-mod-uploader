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
exports.zipDirectory = zipDirectory;
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Compresses the specified directory into a .zip file
 * @param sourceDir - Path to the directory to compress
 * @param outPath - Path where the .zip file should be saved
 */
function zipDirectory(sourceDir, outPath) {
    return __awaiter(this, void 0, void 0, function* () {
        outPath = (0, path_1.resolve)(outPath);
        const output = (0, fs_1.createWriteStream)(outPath);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        // from relative path to absolute path
        return new Promise((resolve, reject) => {
            output.on('close', () => resolve(output.path));
            archive.on('error', (err) => reject(err));
            archive.pipe(output);
            archive.directory(sourceDir, false);
            archive.finalize();
        });
    });
}
