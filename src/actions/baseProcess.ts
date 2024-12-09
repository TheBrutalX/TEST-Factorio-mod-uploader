import * as core from '@actions/core';
import { IBaseProcess } from '../interfaces/IBaseProcess';
import { getInput, InputOptions } from '@actions/core';

export default abstract class BaseProcess implements IBaseProcess {
    abstract parseInputs(): void;

    abstract run(): Promise<void>;

    protected getInput(
        name: string,
        required: boolean = true,
        inputOption: InputOptions = {},
    ): string {
        // Get the input value from env if exists
        // For env, the name is uppercased and '-' is replaced with '_'
        // For example, input name 'mod-name' will be 'MOD_NAME
        const envName = name.replace(/-/g, '_').toUpperCase();
        const envValue = process.env[envName];
        const userValue = getInput(name, inputOption);
        // If the value is required and not provided, throw an error
        if (required && !envValue && !userValue) {
            throw new Error(`Input required and not supplied: ${name}`);
        }
        if(!required && !envValue && !userValue) {
            core.debug(`Input not required and not supplied: ${name}`);
        }
        // if user value is provided, return it
        if (userValue) return userValue;
        else return envValue!;
    }

    protected debug(message: string): void {
        core.debug(message);
    }

    protected info(message: string): void {
        core.info(message);
    }

    protected warning(message: string): void {
        core.warning(message);
    }

    protected error(message: string): void {
        core.error(message);
    }

    protected exportVariable(name: string, value: string): void {
        core.exportVariable(name, value);
    }

    protected setFailed(message: string): void {
        core.setFailed(message);
    }
}
