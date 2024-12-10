export class FactorioModPortalApiError extends Error {
    constructor(message: string, stack?: string) {
        super(message);
        this.name = 'UnhandledError';
        if (stack) this.stack = stack;
    }
}

export class FactorioModPortalApiInvalidApiTokenError extends FactorioModPortalApiError {
    constructor(stack?: string) {
        super('Missing, invalid or API token does not have permission for the current endpoint', stack);
        this.name = 'InvalidApiKey';
    }
}

export class FactorioModPortalApiPermissionError extends FactorioModPortalApiError {
    constructor(stack?: string) {
        super('The API token does not have permission for the current endpoint', stack);
        this.name = 'PermissionError';
    }
}

export class FactorioModPortalApiModNotFoundError extends FactorioModPortalApiError {
    constructor(stack?: string) {
        super('The mod does not exist', stack);
        this.name = 'ModNotFoundError';
    }
}

export class FactorioModPortalApiInvalidModReleaseError extends FactorioModPortalApiError {
    constructor(stack?: string) {
        super('Invalid release data in info.json', stack);
        this.name = 'InvalidModReleaser';
    }
}

export class FactorioModPortalApiUnknownError extends FactorioModPortalApiError {
    constructor(stack?: string) {
        super('An unknown error occured', stack);
        this.name = 'UnknownError';
    }
}

export class FactorioModPortalApiInvalidRequestError extends FactorioModPortalApiError {
    constructor(stack?: string) {
        super('Invalid request', stack);
        this.name = 'InvalidRequest';
    }
}
export class FactorioModPortalApiInternalError extends FactorioModPortalApiError {
    constructor(stack?: string) {
        super('Error on Factorio system. Internal error, please try again later.', stack);
        this.name = 'InternalError';
    }
}
export class FactorioModPortalApiForbiddenError extends FactorioModPortalApiError {
    constructor(stack?: string) {
        super('Insufficent permission for current action', stack);
        this.name = 'Forbidden';
    }
}
export class FactorioModPortalApiInvalidModError extends FactorioModPortalApiError {
    constructor(stack?: string) {
        super('Invalid release data in info.json', stack);
        this.name = 'InvalidModRelease';
    }
}
export class FactorioModPortalApiInvalidUploadError extends FactorioModPortalApiError {
    constructor(stack?: string) {
        super('	Invalid mod data in zipfile', stack);
        this.name = 'InvalidModUpload';
    }
}
export class FactorioModPortalApiModAlreadyExistsError extends FactorioModPortalApiError {
    constructor(stack?: string) {
        super('Mod name already exists on the portal', stack);
        this.name = 'ModAlreadyExists';
    }
}