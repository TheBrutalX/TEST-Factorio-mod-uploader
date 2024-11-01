import * as core from '@actions/core';
import path from 'path';
import semver from 'semver';
import fs from 'fs';
import { IBaseProcess } from '../interfaces/IBaseProcess';
import FactorioModPortalApiService from '../services/FactorioModPortalApiService';

export default class ValidateProcess implements IBaseProcess {
    private modPath: string = '';

    parseInputs(): void {
        this.modPath = core.getInput('MOD-DIR', { required: false });
        if (!this.modPath) this.modPath = process.cwd();
    }

    async run(): Promise<void> {
        const infoPath = path.join(this.modPath, 'info.json');
        if (!fs.existsSync(infoPath)) throw new Error('info.json not found');
        const info = require(infoPath);

        if (!info.name) throw new Error('Missing mod name in info.json');
        if (!info.version) throw new Error('Missing mod version in info.json');

        // Check mod name lenght
        if (info.name.length < 3) throw new Error('Mod name is too short');
        if (info.name.length > 100) throw new Error('Mod name is too long');
        // Check if the mod name is a valid mod name
        if (!/^[a-z0-9_-]+$/i.test(info.name))
            throw new Error('Invalid mod name in info.json');

        // Check if the mod version is a valid semver version
        if (!this.isValidVersion(info.version))
            throw new Error('Invalid version in info.json');
        core.info(`Mod name: ${info.name}`);
        core.info(`Mod version: ${info.version}`);
        core.debug('info.json is valid');

        if (!(await this.checkOnlineVersion(info.name, info.version)))
            throw new Error(
                'Mod already exists on the mod portal with the same version'
            );

        core.exportVariable('MOD_NAME', info.name);
        core.exportVariable('MOD_VERSION', info.version);
        core.exportVariable('MOD-DIR', this.modPath);
    }

    private async checkOnlineVersion(
        name: string,
        version: string
    ): Promise<boolean> {
        const latestVersion =
            await FactorioModPortalApiService.getLatestModVersion(name);
        return semver.gt(version, latestVersion);
    }

    private isValidVersion(version: string) {
        // Check if the version is a valid semver version
        return semver.valid(version) !== null;
    }
}
