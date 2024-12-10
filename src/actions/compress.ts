import * as core from '@actions/core';
import { zipDirectory } from '../utils/zipper';
import { existsSync } from 'fs';
import fsp from 'fs/promises';
import { posix as path } from 'path';
import BaseProcess from './baseProcess';
import { FactorioIgnoreParser } from '@/utils/FactorioIgnoreParser';
import { FACTORIOIGNORE_FILE_NAME, INPUT_DOTIGNORE_FILE, INPUT_MOD_FOLDER, INPUT_MOD_NAME, INPUT_MOD_VERSION } from '@/constants';
export default class CompressProcess extends BaseProcess {
    private modName: string = '';
    private modPath: string = '';
    private modVersion: string = '';
    private tmpPath: string = '';
    private dotignorefile!: string ;

    parseInputs(): void {
        this.modName = this.getInput(INPUT_MOD_NAME);
        this.modPath = this.getInput(INPUT_MOD_FOLDER);
        this.modVersion = this.getInput(INPUT_MOD_VERSION);
        this.tmpPath = process.env.RUNNER_TEMP || '';
        if (!this.tmpPath) throw new Error('RUNNER-TEMP is required');
        this.dotignorefile = this.getInput(INPUT_DOTIGNORE_FILE, false, undefined);
        if (!this.dotignorefile) {
            this.debug(`No DOTIGNORE-FILE specified, using default ${FACTORIOIGNORE_FILE_NAME}`);
            this.dotignorefile = FACTORIOIGNORE_FILE_NAME;
        }
    }
    async run(): Promise<void> {
        let dotignoreContent = '';
        const dotignorePath = path.normalize(path.join(this.modPath, this.dotignorefile));
        if(!existsSync(dotignorePath)){
            core.warning(`No ${this.dotignorefile} found, skipping compression`);
            core.warning(`Please create a ${this.dotignorefile} file to specify which files to ignore`);
            core.warning(`For this action use the default ${FACTORIOIGNORE_FILE_NAME} file directive`);
            core.warning(`For more information visit the WIKI`);
        } else {
            dotignoreContent = await fsp.readFile(dotignorePath, 'utf8');
        }
        const zipName = this.normalizedZipName();
        core.info(`Creating zip file: ${zipName}`);
        const zipDir = path.normalize(path.join(this.tmpPath, 'zip'));
        const modDir = path.normalize(path.join(zipDir, this.modName));
        if(existsSync(modDir)){
            core.warning(`The directory ${modDir} already exists, deleting it`);
            await fsp.rm(modDir, { recursive: true });
        }
        const fip = new FactorioIgnoreParser(dotignoreContent);
        fip.getPatterns().forEach(p => core.info(`Pattern: ${p.pattern}`));
        await fip.copyNonIgnoredFiles(this.modPath, modDir, {
            readdir: fsp.readdir,
            mkdir: fsp.mkdir,
            copyFile: fsp.copyFile,
            stat: fsp.stat,
            normalize: path.normalize
        });
        const zipPath = path.normalize(`${this.tmpPath}/${zipName}`);
        const absolutePath = await zipDirectory(zipDir, zipPath);
        await fsp.rm(zipDir, { recursive: true });
        this.info(`Zip file created: ${absolutePath}`);
        this.exportVariable('ZIP-FILE', absolutePath);
    }

    private normalizedZipName(): string {
        const modName = this.modName.replace(/[^a-z0-9_-]/gi, '-');
        return `${modName}_${this.modVersion}.zip`;
    }
}