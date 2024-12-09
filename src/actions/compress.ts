import * as core from '@actions/core';
import { zipDirectory } from '../utils/zipper';
import { cp, mkdir, rm } from 'fs/promises';
import { posix as path } from 'path';
import BaseProcess from './baseProcess';
export default class CompressProcess extends BaseProcess {
    private modName: string = '';
    private modPath: string = '';
    private modVersion: string = '';
    private tmpPath: string = '';

    parseInputs(): void {
        this.modName = this.getInput('MOD-NAME');
        this.modPath = this.getInput('MOD-FOLDER');
        this.modVersion = this.getInput('MOD-VERSION');
        this.tmpPath = process.env.RUNNER_TEMP || '';

        if (!this.tmpPath) throw new Error('RUNNER_TEMP is required');
    }
    async run(): Promise<void> {
        const zipName = this.normalizedZipName();
        core.info(`Creating zip file: ${zipName}`);
        const zipDir = path.normalize(path.join(this.tmpPath, 'zip'));
        const modDir = path.normalize(path.join(zipDir, this.modName));
        await mkdir(modDir, { recursive: true });
        await cp(this.modPath, modDir, { recursive: true });
        const zipPath = path.normalize(`${this.tmpPath}/${zipName}`);
        const absolutePath = await zipDirectory(zipDir, zipPath);
        rm(zipDir, { recursive: true });
        core.info(`Zip file created: ${absolutePath}`);
        core.exportVariable('ZIP_FILE', absolutePath);
    }

    private normalizedZipName(): string {
        const modName = this.modName.replace(/[^a-z0-9_-]/gi, '-');
        return `${modName}_${this.modVersion}.zip`;
    }
}
