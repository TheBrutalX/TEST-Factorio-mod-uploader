import { IBaseProcess } from '../interfaces/IBaseProcess';
import * as core from '@actions/core';
import { existsSync } from 'fs';
import FormData from 'form-data';
import FactorioModPortalApiService from '../services/FactorioModPortalApiService';

export default class UploadProcess implements IBaseProcess {
    private modName: string = '';
    private modZipPath: string = '';
    private modApiToken: string = '';

    parseInputs(): void {
        this.modName = core.getInput('MOD_NAME', { required: true });
        this.modZipPath = core.getInput('ZIP_PATH', { required: true });
        this.modApiToken = core.getInput('API_TOKEN', { required: true });

        if (existsSync(this.modZipPath) === false) {
            throw new Error(`File not found: ${this.modZipPath}`);
        }
    }

    async run(): Promise<void> {
        // Upload mod
        core.info(`Uploading mod: ${this.modName}`);
        const uploadUrl = await this.getUploadUrl();
        await this.uploadMod(uploadUrl);
    }
    async getUploadUrl(): Promise<string> {
        return await FactorioModPortalApiService.ModUploadInit(
            this.modApiToken,
            this.modName
        );
    }

    async uploadMod(upload_url: string): Promise<void> {
        FactorioModPortalApiService.ModUploadFinish(
            this.modApiToken,
            upload_url,
            this.modZipPath
        );
        core.info('Mod uploaded successfully');
    }

    async convertFormDataToBuffer(formData: FormData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const buffers = new Array<Buffer>();
            formData.on('data', (chunk) => buffers.push(chunk));
            formData.on('end', () => resolve(Buffer.concat(buffers)));
            formData.on('error', (err) => reject(err));
        });
    }
}
