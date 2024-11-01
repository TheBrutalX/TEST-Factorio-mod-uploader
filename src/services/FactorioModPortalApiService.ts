import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { basename } from 'path';
const modApiUrl = 'https://mods.factorio.com/api';

const axiosInstance = axios.create({
    timeout: 1000,
});

export default class FactorioModPortalApiService {
    public static async getLatestModVersion(name: string): Promise<string> {
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
            throw new Error(`Error fetching mod info: ${error}`);
        }
    }

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
                if (e.response?.status === 401)
                    throw new Error('Invalid API token');
                if (e.response?.status === 403)
                    throw new Error(
                        'The API token does not have permission to upload mods'
                    );
                if (e.response?.status === 404) {
                    if (e.response.data.error) {
                        switch (e.response.data.error) {
                            case 'UnknownMod':
                                throw new Error('The mod does not exist');
                            case 'InvalidMod':
                                throw new Error('The mod name is invalid');
                            default:
                                throw e;
                        }
                    } else {
                        throw e;
                    }
                }
            }
            throw e;
        }
    }

    public static async ModUploadFinish(
        token: string,
        upload_url: string,
        modZipPath: string
    ): Promise<void> {
        const formData = new FormData();
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
                if (e.response?.status === 401)
                    throw new Error('Invalid API token');
                if (e.response?.status === 403)
                    throw new Error(
                        'The API token does not have permission to upload mods'
                    );
                if (e.response?.status === 400)
                    throw new Error(
                        'The mod file is invalid or equal to an existing release'
                    );
                throw new Error(e.message);
            }
            throw e;
        }
    }
}

//#region Interfaces
interface ModUploadErrorResponse {
    error?: string; // Appears only on failed requests
    message?: string; // Appears only on failed requests with details about the problem
}

interface InitUploadResponse extends ModUploadErrorResponse {
    upload_url?: string; // Appears only on successful requests
}

interface FinishUploadResponse extends ModUploadErrorResponse {
    success?: boolean; // Appears only on successful requests
}

// Main Mod interface
interface ModInfo {
    latest_release?: Release; // The latest version of the mod available for download
    downloads_count?: number; // Number of downloads
    name: string; // The mod's machine-readable ID string
    owner: string; // The Factorio username of the mod's author
    releases?: Release[]; // A list of different versions of the mod available for download
    summary: string; // A shorter mod description
    title: string; // The mod's human-readable name
    category?: Category; // A single category describing the mod
    score?: number; // The score of the mod. Absent when 0
    thumbnail?: string; // The relative path to the thumbnail of the mod
    changelog?: string; // A string describing the recent changes to a mod
    created_at?: string; // ISO 8601 date for when the mod was created
    description?: string; // A longer description of the mod
    source_url?: string; // A URL to the mod's source code
    github_path?: string; // Deprecated: Use source_url instead
    homepage?: string; // A URL to the mod's main project page
    tags?: Tag[]; // A list of tag names that categorize the mod
    license?: License[]; // The license that applies to the mod
    deprecated?: boolean; // True if the mod is marked as deprecated
}

// Release interface
interface Release {
    download_url: string; // Path to download for a mod
    file_name: string; // The file name of the release
    info_json: InfoJson; // A copy of the mod's info.json file
    released_at: string; // ISO 8601 date for when the mod was released
    version: string; // The version string of this mod release
    sha1: string; // The sha1 key for the file
}

// InfoJson interface for Release
interface InfoJson {
    factorio_version: string; // The version of Factorio required for this mod
    dependencies?: string[]; // An array of dependencies in the full version
}

// Category interface
interface Category {
    id: string; // ID of the category
    name: string; // Name of the category
}

// Tag interface
interface Tag {
    id: string; // ID of the tag
    name: string; // Name of the tag
}

// License interface
interface License {
    name: string; // Name of the license
    url: string; // URL to the license details
}
//#endregion
