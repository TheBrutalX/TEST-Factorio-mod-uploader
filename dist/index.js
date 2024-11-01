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
exports.run = run;
const core_1 = require("@actions/core");
const compress_1 = __importDefault(require("./actions/compress"));
const upload_1 = __importDefault(require("./actions/upload"));
const validate_1 = __importDefault(require("./actions/validate"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const action = (0, core_1.getInput)('action');
            let instance = {};
            switch (action) {
                case 'validate':
                    instance = new validate_1.default();
                    break;
                case 'compress':
                    instance = new compress_1.default();
                    break;
                case 'upload':
                    instance = new upload_1.default();
                    break;
                default:
                    throw new Error('Invalid action. Please use validate');
            }
            instance.parseInputs();
            yield instance.run();
            return true;
        }
        catch (error) {
            if (error instanceof Error)
                (0, core_1.setFailed)(error.message);
            return false;
        }
    });
}
if (process.env.NODE_ENV !== 'development') {
    run();
}
