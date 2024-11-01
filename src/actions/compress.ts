import { IBaseProcess } from '../interfaces/IBaseProcess';
import * as core from '@actions/core';
import { zipDirectory } from '../utils/zipper';
import { cp, mkdir, rm } from 'fs/promises';
import { join } from 'path';
export default class CompressProcess implements IBaseProcess {
    private modName: string = '';
    private modPath: string = '';
    private modVersion: string = '';
    private tmpPath: string = '';

    parseInputs(): void {
        this.modName = core.getInput('MOD_NAME', { required: true });
        this.modPath = core.getInput('MOD-FOLDER', { required: true });
        this.modVersion = core.getInput('MOD_VERSION', { required: true });
        this.tmpPath = process.env.RUNNER_TEMP || '';

        if (!this.tmpPath) throw new Error('RUNNER_TEMP is required');
    }
    async run(): Promise<void> {
        const zipName = this.normalizedZipName();
        core.info(`Creating zip file: ${zipName}`);
        const zipDir = join(this.tmpPath, 'zip');
        const modDir = join(zipDir, this.modName);
        await mkdir(modDir, { recursive: true });
        await cp(this.modPath, modDir, { recursive: true });
        const zipPath = `${this.tmpPath}/${zipName}`;
        const absolutePath = await zipDirectory(zipDir, zipPath);
        rm(zipDir, { recursive: true });
        core.info(`Zip file created: ${absolutePath}`);
        core.exportVariable('ZIP_PATH', absolutePath);
    }

    private normalizedZipName(): string {
        const modName = this.modName.replace(/[^a-z0-9_-]/gi, '-');
        return `${modName}_${this.modVersion}.zip`;
    }
}
