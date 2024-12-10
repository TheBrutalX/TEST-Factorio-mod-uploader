import path from 'path';
import fs from 'fs';
import { readFile } from 'fs/promises';
import BaseProcess from './baseProcess';
import ActionHelper from '@/utils/ActionHelper';
import { INPUT_MOD_FOLDER } from '@/constants';

export default class ValidateProcess extends BaseProcess {
    private modPath: string = '';

    parseInputs(): void {
        this.modPath = this.getInput(INPUT_MOD_FOLDER, false);
        if (!this.modPath) this.modPath = process.env.GITHUB_WORKSPACE!;
    }

    async run(): Promise<void> {
        const infoPath = path.join(this.modPath, 'info.json');
        if (!fs.existsSync(infoPath)) throw new Error('info.json not found');
        this.debug('info.json path: ' + infoPath);
        const infoRaw = await readFile(infoPath, 'utf8');
        const info = JSON.parse(infoRaw);

        if (!info.name) throw new Error('Missing mod name in info.json');
        if (!info.version) throw new Error('Missing mod version in info.json');

        // Check mod name lenght
        if (info.name.length < 3) throw new Error('Mod name is too short');
        if (info.name.length > 100) throw new Error('Mod name is too long');
        // Check if the mod name is a valid mod name
        if (!/^[a-z0-9_-]+$/i.test(info.name))
            throw new Error('Invalid mod name in info.json');

        // Check if the mod version is a valid semver version
        if (!ActionHelper.isValidVersion(info.version))
            throw new Error('Invalid version in info.json');
        this.info(`Mod name: ${info.name}`);
        this.info(`Mod version: ${info.version}`);
        this.debug('info.json is valid');
        
        this.exportVariable('MOD-FOLDER', this.modPath);
        
        const alreadyExist = await ActionHelper.checkModOnPortal(info.name);
        // IF the mod is already on the portal, we don't need to create it on the upload phase
        const needCreate = !alreadyExist;
        this.exportVariable('CREATE-ON-PORTAL', needCreate.toString());
        if(alreadyExist) {
            const needUpdate = await ActionHelper.checkModVersion(info.name, info.version);
            if(!needUpdate) { 
                throw new Error(`Mod '${info.name}' version '${info.version}' is already on the portal`);
            }
        }

        this.exportVariable('MOD-NAME', info.name);
        this.exportVariable('MOD-VERSION', info.version);
    }
}
