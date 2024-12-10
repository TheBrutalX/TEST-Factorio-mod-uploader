export interface FactorioErrorResponse {
    error: string;
    message: string;
}

//#region Interfaces
export interface ModErrorResponse {
    error?: string; // Appears only on failed requests
    message?: string; // Appears only on failed requests with details about the problem
}

export interface ModInitResponse extends ModErrorResponse {
    upload_url?: string; // Appears only on successful requests
}

export interface InitUploadResponse extends ModInitResponse { }

export interface FinishUploadResponse extends ModErrorResponse {
    success?: boolean; // Appears only on successful requests
}

export interface InitPublishResponse extends ModInitResponse { }

// Main Mod interface
export interface ModInfo {
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
export interface Release {
    download_url: string; // Path to download for a mod
    file_name: string; // The file name of the release
    info_json: InfoJson; // A copy of the mod's info.json file
    released_at: string; // ISO 8601 date for when the mod was released
    version: string; // The version string of this mod release
    sha1: string; // The sha1 key for the file
}

// InfoJson interface for Release
export interface InfoJson {
    factorio_version: string; // The version of Factorio required for this mod
    dependencies?: string[]; // An array of dependencies in the full version
}

// Category interface
export interface Category {
    id: string; // ID of the category
    name: string; // Name of the category
}

// Tag interface
export interface Tag {
    id: string; // ID of the tag
    name: string; // Name of the tag
}

// License interface
export interface License {
    name: string; // Name of the license
    url: string; // URL to the license details
}
//#endregion