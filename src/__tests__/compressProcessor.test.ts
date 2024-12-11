import * as core from '@actions/core';
import { INPUT_MOD_FOLDER, INPUT_MOD_NAME, PROCESS_MOD_VERSION, PROCESS_ZIP_FILE } from '@constants';
import { IFactorioIgnoreRule } from '@interfaces/IFactorioIgnoreRule';
import CompressProcess from '@phases/compress';
import { FactorioIgnoreParser } from '@services/FactorioIgnoreParser';
import { zipDirectory } from '@utils/zipper';
import { rm } from 'fs/promises';
import { posix as path } from 'path';

jest.mock('@actions/core');
jest.mock('fs/promises');
jest.mock('@utils/zipper');
jest.mock('@services/FactorioIgnoreParser');

describe('CompressProcess', () => {
    let compressProcess: CompressProcess;

    beforeEach(() => {
        compressProcess = new CompressProcess();
        process.env.RUNNER_TEMP = '/tmp';
        jest.clearAllMocks();
    });

    it('should run the compression process', async () => {
        jest.spyOn(compressProcess as any, 'getInput').mockImplementation(
            (name: any) => {
                switch (name) {
                    case INPUT_MOD_NAME:
                        return 'test-mod';
                    case INPUT_MOD_FOLDER:
                        return '/folder';
                    case PROCESS_MOD_VERSION:
                        return '1.0.0';
                    default:
                        return '';
                }
            }
        );

        (zipDirectory as jest.Mock).mockResolvedValue(
            '/tmp/test-mod_1.0.0.zip'
        );
        compressProcess.parseInputs();
        const tmpPath = path.normalize('/tmp');
        (FactorioIgnoreParser.prototype.getPatterns as jest.MockedFunction<() => IFactorioIgnoreRule[]>).mockReturnValue([]);

        (compressProcess as any)['tmpPath'] = tmpPath; // Set the tmpPath to the current path
        await compressProcess.run();
        expect(zipDirectory).toHaveBeenCalledWith(
            path.normalize('/tmp/zip'),
            path.normalize('/tmp/test-mod_1.0.0.zip')
        );
        expect(rm).toHaveBeenCalledWith(path.normalize('/tmp/zip'), { recursive: true });
        expect(core.info).toHaveBeenCalledWith(
            'Creating zip file: test-mod_1.0.0.zip'
        );
        expect(core.info).toHaveBeenCalledWith(
            'Zip file created: /tmp/test-mod_1.0.0.zip'
        );
        expect(core.exportVariable).toHaveBeenCalledWith(
            PROCESS_ZIP_FILE,
            '/tmp/test-mod_1.0.0.zip'
        );
    });

    it('should parse inputs correctly', () => {
        jest.spyOn(compressProcess as any, 'getInput').mockImplementation(
            (name: any) => {
                switch (name) {
                    case INPUT_MOD_NAME:
                        return 'test-mod';
                    case INPUT_MOD_FOLDER:
                        return '/folder';
                    case PROCESS_MOD_VERSION:
                        return '1.0.0';
                    default:
                        return '';
                }
            }
        );

        compressProcess.parseInputs();

        expect(compressProcess['modName']).toBe('test-mod');
        expect(compressProcess['modPath']).toBe('/folder');
        expect(compressProcess['modVersion']).toBe('1.0.0');
        expect(compressProcess['tmpPath']).toBe('/tmp');
    });

    it('should throw an error if RUNNER-TEMP is not set', () => {
        delete process.env.RUNNER_TEMP;

        jest.spyOn(compressProcess as any, 'getInput').mockImplementation(
            (name: any) => {
                switch (name) {
                    case 'MOD-NAME':
                        return 'test-mod';
                    case 'MOD-VERSION':
                        return '1.0.0';
                    default:
                        return '';
                }
            }
        );

        expect(() => compressProcess.parseInputs()).toThrow(
            'RUNNER-TEMP is required'
        );
    });
});
