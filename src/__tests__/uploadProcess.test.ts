import * as core from '@actions/core';
import { INPUT_FACTORIO_API_KEY, INPUT_MOD_FOLDER, INPUT_MOD_NAME, PROCESS_CREATE_ON_PORTAL, PROCESS_ZIP_FILE } from '@constants';
import UploadProcess from '@phases/upload';
import fs from 'fs';

jest.mock('@actions/core', () => {
    return {
        debug: jest.fn(),
        error: jest.fn(),
        exportVariable: jest.fn(),
        getInput: jest.fn(),
        info: jest.fn(),
        setFailed: jest.fn(),
        warning: jest.fn()
    }
});
jest.mock('@services/FactorioModPortalApiService');

describe('UploadProcess', () => {
    let uploadProcess: UploadProcess;

    beforeEach(() => {
        uploadProcess = new UploadProcess();
        jest.clearAllMocks();
    });

    describe('parseInputs', () => {
        it('should parse inputs correctly', () => {
            jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
                switch (name) {
                    case INPUT_MOD_FOLDER:
                        return 'test-mod';
                    case INPUT_MOD_NAME:
                        return 'test-mod';
                    case PROCESS_ZIP_FILE:
                        return './dist/test-mod_1.0.0.zip';
                    case INPUT_FACTORIO_API_KEY:
                        return 'test-api-key';
                    case PROCESS_CREATE_ON_PORTAL:
                        return 'false';
                    default:
                        return '';
                }
            });

            jest.spyOn(fs, 'existsSync').mockReturnValue(true);

            uploadProcess.parseInputs();

            expect(uploadProcess['modName']).toBe('test-mod');
            expect(uploadProcess['modZipPath']).toBe(
                './dist/test-mod_1.0.0.zip'
            );
            expect(uploadProcess['modApiToken']).toBe('test-api-key');
        });

        it('should throw an error if ZIP_FILE does not exist', () => {
            jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
                switch (name) {
                    case INPUT_MOD_FOLDER:
                        return 'test-mod';
                    case INPUT_MOD_NAME:
                        return 'test-mod';
                    case PROCESS_ZIP_FILE:
                        return './dist/test-mod_1.0.0.zip';
                    case INPUT_FACTORIO_API_KEY:
                        return 'test-api-key';
                    case PROCESS_CREATE_ON_PORTAL:
                        return 'false';
                    default:
                        return '';
                }
            });

            jest.spyOn(fs, 'existsSync').mockReturnValue(false);

            expect(() => uploadProcess.parseInputs()).toThrow(
                `File not found: './dist/test-mod_1.0.0.zip', please check the path or check if the compress action is running before this action`
            );
        });

        it('should throw an error if any input is missing', () => {
            jest.spyOn(core, 'getInput').mockImplementation(() => {
                return '';
            });

            expect(() => uploadProcess.parseInputs()).toThrow();
        });
    });

    // describe('run', () => {
    //     beforeEach(() => {
    //         jest.spyOn(uploadProcess, 'parseInputs').mockImplementation(() => {
    //             uploadProcess['modName'] = 'test-mod';
    //             uploadProcess['modZipPath'] = './dist/test-mod_1.0.0.zip';
    //             uploadProcess['modApiToken'] = 'test-api-key';
    //         });

    //         jest.spyOn(uploadProcess, 'getUploadUrl').mockResolvedValue(
    //             'https://api.example.com/upload'
    //         );
    //         jest.spyOn(uploadProcess, 'uploadMod').mockResolvedValue();
    //     });

    //     it('should handle errors thrown during the run process', async () => {
    //         uploadProcess.getUploadUrl = jest
    //             .fn()
    //             .mockRejectedValue(new Error('API Error'));

    //         await expect(uploadProcess.run()).rejects.toThrow('API Error');
    //     });
    // });

    // describe('getUploadUrl', () => {
    //     it('should get upload URL successfully', async () => {
    //         uploadProcess['modName'] = 'test-mod';
    //         uploadProcess['modApiToken'] = 'test-api-key';

    //         (
    //             FactorioModPortalApiService.ModUploadInit as jest.Mock
    //         ).mockResolvedValue('https://api.example.com/upload');

    //         const url = await uploadProcess.getUploadUrl();

    //         expect(
    //             FactorioModPortalApiService.ModUploadInit
    //         ).toHaveBeenCalledWith('test-api-key', 'test-mod');
    //         expect(url).toBe('https://api.example.com/upload');
    //     });

    //     it('should throw an error if ModUploadInit fails', async () => {
    //         uploadProcess['modName'] = 'test-mod';
    //         uploadProcess['modApiToken'] = 'test-api-key';

    //         (
    //             FactorioModPortalApiService.ModUploadInit as jest.Mock
    //         ).mockRejectedValue(new Error('Initialization Error'));

    //         await expect(uploadProcess.getUploadUrl()).rejects.toThrow(
    //             'Initialization Error'
    //         );
    //     });
    // });
});
