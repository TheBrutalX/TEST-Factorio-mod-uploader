import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { basename } from 'path';
import * as fmpe from '@errors/FactorioModPortalApiErrors';
import { FactorioErrorResponse, FinishUploadResponse, InitPublishResponse, InitUploadResponse, ModInfo } from './interfaces';
import { IModInfoCreate } from '@/interfaces/IModInfoCreate';

const modApiUrl = 'https://mods.factorio.com/api';
const axiosInstance = axios.create({
    timeout: 1000,
});

export default class FactorioModPortalApiService {
    //#region Internal API
    
    public static async CheckIfModIsPublished(name: string): Promise<boolean> {
        try {
            const url = `${modApiUrl}/mods/${name}`;
            await axiosInstance.get<ModInfo>(url);
            return true;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 404) return false;
            }
            throw new Error(`Error fetching mod info: ${error}`);
        }
    }

    public static async getLatestModVersion(name: string): Promise<string | undefined> {
        try {
            const url = `${modApiUrl}/mods/${name}`;
            const response = await axiosInstance.get<ModInfo>(url);
            const modInfo = response.data;
            if (modInfo.releases && modInfo.releases.length > 0) {
                const latestRelease = modInfo.releases.reduce(
                    (latest, release) => {
                        return new Date(release.released_at) >
                            new Date(latest.released_at)
                            ? release
                            : latest;
                    },
                    modInfo.releases[0]
                );
                return latestRelease.version;
            } else {
                throw new Error('No releases found for the mod.');
            }
        } catch (error) {
            // If error is 404, the mod does not exist, check if error is axiosError
            if(error instanceof AxiosError) {
                if (error.response?.status === 404) throw new fmpe.FactorioModPortalApiModNotFoundError();
            } else {
                throw new Error(`Error fetching mod info: ${error}`);
            }
        }
    }

    //#endregion

    //#region Public API

    //#region Mod Upload

    public static async ModUploadInit(
        token: string,
        modName: string
    ): Promise<string> {
        const url = `${modApiUrl}/v2/mods/releases/init_upload`;
        const formData = new FormData();
        formData.append('mod', modName);
        try {
            const response = await axios.post<InitUploadResponse>(
                url,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ...formData.getHeaders(),
                    },
                }
            );
            return response.data.upload_url!;
        } catch (e) {
            if (e instanceof AxiosError) {
                FactorioModPortalApiService.HandleFactorioModPortalApiError(e);
            }
            throw e;
        }
    }

    public static async ModUploadFinish(
        token: string,
        upload_url: string,
        modZipPath: string
    ): Promise<void> {
        const uploadFormData = new FormData();
        const fileData = createReadStream(modZipPath);
        const fileName = basename(modZipPath);
        uploadFormData.append('file', fileData, fileName);

        try {
            const response = await axios.post<FinishUploadResponse>(
                upload_url,
                uploadFormData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ...uploadFormData.getHeaders(),
                    },
                }
            );
            if (response.data.success !== true) {
                throw new Error(
                    `Failed to upload mod: ${response.data.message}`
                );
            }
        } catch (e) {
            if (e instanceof AxiosError) {
                FactorioModPortalApiService.HandleFactorioModPortalApiError(e);
            }
            throw e;
        }
    }

    //#endregion Mod Upload

    //#region Mod Publish

    public static async ModPublishInit(
        token: string, 
        modName: string): Promise<string> {
        const url = `${modApiUrl}/v2/mods/init_publish`;
        const formData = new FormData();
        formData.append('mod', modName);
        try {
            const response = await axios.post<InitPublishResponse>(
                url,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ...formData.getHeaders(),
                    },
                }
            );
            return response.data.upload_url!;
        } catch (e) {
            if (e instanceof AxiosError) {
                FactorioModPortalApiService.HandleFactorioModPortalApiError(e);
            }
            throw e;
        }
    }

    public static async ModPublishFinish(
        token: string,
        upload_url: string,
        modInfo: IModInfoCreate,
        modZipPath: string
    ): Promise<void> {
        const uploadFormData = new FormData();
        const fileData = createReadStream(modZipPath);
        const fileName = basename(modZipPath);
        uploadFormData.append('file', fileData, fileName);
        if(modInfo.description) uploadFormData.append('description', modInfo.description);
        if(modInfo.license) uploadFormData.append('license', modInfo.license);
        if(modInfo.sourceUrl) uploadFormData.append('source_url', modInfo.sourceUrl);
        if(modInfo.categories) {
            for(const category of modInfo.categories) {
                uploadFormData.append('categories[]', category);
            }
        }

        try {
            const response = await axios.post<FinishUploadResponse>(
                upload_url,
                uploadFormData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ...uploadFormData.getHeaders(),
                    },
                }
            );
            if (response.data.success !== true) {
                throw new Error(
                    `Failed to publish mod: ${response.data.message}`
                );
            }
        } catch (e) {
            if (e instanceof AxiosError) {
                FactorioModPortalApiService.HandleFactorioModPortalApiError(e);
            }
            throw e;
        }
    }

    //#endregion Mod Publish

    //#endregion    

    private static HandleFactorioModPortalApiError(e: AxiosError): void {
        if(e.response === undefined) throw new fmpe.FactorioModPortalApiError('Unknown error', e.stack);
        if(!e.response.data) throw new fmpe.FactorioModPortalApiError('Unknown error', e.stack);
        
        const errorResponse = e.response.data as FactorioErrorResponse;
        if (!errorResponse.error) throw new fmpe.FactorioModPortalApiError('Missing error on body', e.stack);
        switch (errorResponse.error) {
            case 'InvalidApiKey':
                throw new fmpe.FactorioModPortalApiInvalidApiTokenError(e.stack);
            case 'InvalidRequest':
                throw new fmpe.FactorioModPortalApiInvalidRequestError(e.stack);
            case 'InternalError':
                throw new fmpe.FactorioModPortalApiInternalError(e.stack);
            case 'Forbidden':   
                throw new fmpe.FactorioModPortalApiForbiddenError(e.stack);
            case 'UnknownMod':
                throw new fmpe.FactorioModPortalApiModNotFoundError(e.stack);
            case 'InvalidModRelease':
                throw new fmpe.FactorioModPortalApiInvalidModReleaseError(e.stack);
            case 'InvalidModUpload':
                throw new fmpe.FactorioModPortalApiInvalidUploadError(e.stack);
            case 'ModAlreadyExists':
                throw new fmpe.FactorioModPortalApiModAlreadyExistsError(e.stack);
            case 'Unknown':
            default:
                throw new fmpe.FactorioModPortalApiUnknownError(e.stack);
        }
    }
}