import * as core from '@actions/core';
import { zipDirectory } from '../utils/zipper';
import { existsSync, promises as fs } from 'fs';
import { posix as path } from 'path';
import BaseProcess from './baseProcess';
import { FactorioIgnoreParser } from '@/utils/FactorioIgnoreParser';
export default class CompressProcess extends BaseProcess {
    private modName: string = '';
    private modPath: string = '';
    private modVersion: string = '';
    private tmpPath: string = '';
    private dotignorefile!: string ;

    parseInputs(): void {
        this.modName = this.getInput('MOD-NAME');
        this.modPath = this.getInput('MOD-FOLDER');
        this.modVersion = this.getInput('MOD-VERSION');
        this.tmpPath = process.env.RUNNER_TEMP || '';
        if (!this.tmpPath) throw new Error('RUNNER_TEMP is required');
        this.dotignorefile = this.getInput('DOTIGNORE-FILE', false, undefined);
        if (!this.dotignorefile) {
            this.debug('No DOTIGNORE-FILE specified, using default .factorioignore');
            this.dotignorefile = '.factorioignore';
        }
    }
    async run(): Promise<void> {
        let dotignoreContent = '';
        const dotignorePath = path.normalize(path.join(this.modPath, this.dotignorefile));
        if(!existsSync(dotignorePath)){
            core.warning(`No ${this.dotignorefile} found, skipping compression`);
            core.warning(`Please create a ${this.dotignorefile} file to specify which files to ignore`);
            core.warning(`For this action use the default .factorioignore file directive`);
            core.warning(`For more information visit the WIKI`);
        } else {
            dotignoreContent = await fs.readFile(dotignorePath, 'utf8');
        }
        const zipName = this.normalizedZipName();
        core.info(`Creating zip file: ${zipName}`);
        const zipDir = path.normalize(path.join(this.tmpPath, 'zip'));
        const modDir = path.normalize(path.join(zipDir, this.modName));
        if(existsSync(modDir)){
            core.warning(`The directory ${modDir} already exists, deleting it`);
            await fs.rm(modDir, { recursive: true });
        }
        const fip = new FactorioIgnoreParser(dotignoreContent);
        fip.getPatterns().forEach(p => core.info(`Pattern: ${p.pattern}`));
        await fip.copyNonIgnoredFiles(this.modPath, modDir, {
            readdir: fs.readdir,
            mkdir: fs.mkdir,
            copyFile: fs.copyFile,
            stat: fs.stat,
            normalize: path.normalize
        });
        const zipPath = path.normalize(`${this.tmpPath}/${zipName}`);
        const absolutePath = await zipDirectory(zipDir, zipPath);
        await fs.rm(zipDir, { recursive: true });
        this.info(`Zip file created: ${absolutePath}`);
        this.exportVariable('ZIP_FILE', absolutePath);
    }

    private normalizedZipName(): string {
        const modName = this.modName.replace(/[^a-z0-9_-]/gi, '-');
        return `${modName}_${this.modVersion}.zip`;
    }
}
