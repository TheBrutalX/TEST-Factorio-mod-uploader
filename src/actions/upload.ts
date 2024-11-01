import * as core from '@actions/core';
import { existsSync } from 'fs';
import FormData from 'form-data';
import FactorioModPortalApiService from '../services/FactorioModPortalApiService';
import BaseProcess from './baseProcess';

export default class UploadProcess extends BaseProcess {
    private modName: string = '';
    private modZipPath: string = '';
    private modApiToken: string = '';

    parseInputs(): void {
        this.modName = this.getInput('MOD-NAME');
        this.modZipPath = this.getInput('ZIP-FILE');
        this.modApiToken = this.getInput('FACTORIO-API-KEY');

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
