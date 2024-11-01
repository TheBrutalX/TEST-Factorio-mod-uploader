"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs_1 = __importDefault(require("fs"));
const factorioModUrl = "https://mods.factorio.com/api/mods";
const factorioModUploadUrl =
  "https://mods.factorio.com/api/v2/mods/releases/init_upload";
class Process {
  static parseInputs() {
    // const modPath = core.getInput('modPath');
    // const username = core.getInput('username');
    // const token = core.getInput('token');
    const modPath = "test";
    const username = "test";
    const token = "test";
    if (!modPath) throw new Error("modPath is required");
    if (!username) throw new Error("username is required");
    if (!token) throw new Error("token is required");
    return { modPath, username, token };
  }
  static run(inputs) {
    return __awaiter(this, void 0, void 0, function* () {
      this.checkInfoFile(inputs.modPath);
      this.createZip(inputs.modPath);
    });
  }
  static checkInfoFile(modPath) {
    const path = require("path");
    const infoPath = path.join(modPath, "info.json");
    if (!fs_1.default.existsSync(infoPath))
      throw new Error("info.json not found");
    const info = require(infoPath);
    if (!info.name) throw new Error("Missing mod name in info.json");
    if (!info.version) throw new Error("Missing mod version in info.json");
    // Check if the mod version is a valid semver version
    if (!this.isValidVersion(info.version))
      throw new Error("Invalid version in info.json");
    core.info(`Mod name: ${info.name}`);
    core.info(`Mod version: ${info.version}`);
    core.debug("info.json is valid");
  }
  static isValidVersion(version) {
    // Check if the version is a valid semver version
    const semver = require("semver");
    return semver.valid(version) !== null;
  }
  static createZip(modPath) {}
}
exports.default = Process;
