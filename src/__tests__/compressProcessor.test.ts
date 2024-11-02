import * as core from '@actions/core';
import { mkdir, cp, rm } from 'fs/promises';
import CompressProcess from '../actions/compress';
import { zipDirectory } from '../utils/zipper';

jest.mock('@actions/core');
jest.mock('fs/promises');
jest.mock('../utils/zipper');

describe('CompressProcess', () => {
    let compressProcess: CompressProcess;

    beforeEach(() => {
        compressProcess = new CompressProcess();
        process.env.RUNNER_TEMP = '/tmp';
        jest.clearAllMocks();
    });

    it('should parse inputs correctly', () => {
        jest.spyOn(compressProcess as any, 'getInput').mockImplementation(
            (name: any) => {
                switch (name) {
                    case 'MOD-NAME':
                        return 'test-mod';
                    case 'MOD-FOLDER':
                        return '/path/to/mod';
                    case 'MOD-VERSION':
                        return '1.0.0';
                    default:
                        return '';
                }
            }
        );

        compressProcess.parseInputs();

        expect(compressProcess['modName']).toBe('test-mod');
        expect(compressProcess['modPath']).toBe('/path/to/mod');
        expect(compressProcess['modVersion']).toBe('1.0.0');
        expect(compressProcess['tmpPath']).toBe('/tmp');
    });

    it('should throw an error if RUNNER_TEMP is not set', () => {
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
            'RUNNER_TEMP is required'
        );
    });

    it('should run the compression process', async () => {
        jest.spyOn(compressProcess as any, 'getInput').mockImplementation(
            (name: any) => {
                switch (name) {
                    case 'MOD-NAME':
                        return 'test-mod';
                    case 'MOD-FOLDER':
                        return '/folder';
                    case 'MOD-VERSION':
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
        (compressProcess as any)['tmpPath'] = '/tmp'; // Override tmpPath
        await compressProcess.run();

        expect(mkdir).toHaveBeenCalledWith('\\tmp\\zip\\test-mod', {
            recursive: true,
        });
        expect(cp).toHaveBeenCalledWith('/folder', '\\tmp\\zip\\test-mod', {
            recursive: true,
        });
        expect(zipDirectory).toHaveBeenCalledWith(
            '\\tmp\\zip',
            '/tmp/test-mod_1.0.0.zip'
        );
        expect(rm).toHaveBeenCalledWith('\\tmp\\zip', { recursive: true });
        expect(core.info).toHaveBeenCalledWith(
            'Creating zip file: test-mod_1.0.0.zip'
        );
        expect(core.info).toHaveBeenCalledWith(
            'Zip file created: /tmp/test-mod_1.0.0.zip'
        );
        expect(core.exportVariable).toHaveBeenCalledWith(
            'ZIP_FILE',
            '/tmp/test-mod_1.0.0.zip'
        );
    });
});
