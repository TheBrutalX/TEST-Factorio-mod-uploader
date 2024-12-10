import * as core from '@actions/core';
import { existsSync } from 'fs';
import FormData from 'form-data';
import FactorioModPortalApiService from '../services/FactorioModPortalApiService';
import BaseProcess from './baseProcess';
import { INPUT_FACTORIO_API_KEY, INPUT_MOD_NAME, INPUT_ZIP_FILE } from '@/constants';

export default class UploadProcess extends BaseProcess {
    private modName: string = '';
    private modZipPath: string = '';
    private modApiToken: string = '';

    parseInputs(): void {
        this.modName = this.getInput(INPUT_MOD_NAME);
        this.modZipPath = this.getInput(INPUT_ZIP_FILE);
        this.modApiToken = this.getInput(INPUT_FACTORIO_API_KEY);

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
        core.debug('Getting upload URL');
        return await FactorioModPortalApiService.ModUploadInit(
            this.modApiToken,
            this.modName
        );
    }

    async uploadMod(upload_url: string): Promise<void> {
        core.debug('Uploading mod');
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
