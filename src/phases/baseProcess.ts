import { debug, error, exportVariable, getInput, info, InputOptions, setFailed, warning } from '@actions/core';
import { IBaseProcess } from '@interfaces/IBaseProcess';

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
        const envName = this.getCorrectEnvName(name);
        const envValue = process.env[envName];
        const userValue = getInput(name, inputOption);
        // If the value is required and not provided, throw an error
        if (required && !envValue && !userValue) {
            throw new Error(`Input required and not supplied: ${name}`);
        }
        if (!required && !envValue && !userValue) {
            debug(`Input not required and not supplied: ${name}`);
        }
        // if user value is provided, return it
        if (userValue) return userValue;
        else return envValue!;
    }

    private getEnvNameWithHyphen(envName: string): string {
        return envName.replace(/-/g, '_').toUpperCase();
    }
    private getEnvNameWithUnderscore(envName: string): string {
        return envName.replace(/_/g, '-').toUpperCase();
    }

    private environmentVariableExists(envName: string): boolean {
        return Object.keys(process.env).some((key: string) => key.toUpperCase() === envName.toUpperCase());
    }

    private getCorrectEnvName(envName: string, prefix?: string): string {
        if (!prefix) prefix = '';
        const hyphenName = prefix + this.getEnvNameWithHyphen(envName);
        const underscoreName = prefix + this.getEnvNameWithUnderscore(envName);
        if (this.environmentVariableExists(hyphenName)) {
            return hyphenName;
        } else if (this.environmentVariableExists(underscoreName)) {
            return underscoreName;
        } else {
            if (!prefix) {
                return this.getCorrectEnvName(envName, 'INPUT_');
            } else {
                return ''
            }
        }
    }

    protected getInputBoolen(
        name: string,
        defaultVal: boolean,
        required: boolean = true,
        inputOption: InputOptions = {}
    ): boolean {
        const value = this.getInput(name, required, inputOption);
        if (!value) return defaultVal;
        // Check if valid boolean value
        if (value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
            throw new Error(`Invalid boolean value: ${name}`);
        }
        return value.toLowerCase() === 'true';
    }

    protected debug(message: string): void {
        return debug(message);
    }

    protected info(message: string): void {
        return info(message);
    }

    protected warning(message: string): void {
        return warning(message);
    }

    protected error(message: string): void {
        return error(message);
    }

    protected exportVariable(name: string, value: string): void {
        return exportVariable(name, value);
    }

    protected setFailed(message: string): void {
        return setFailed(message);
    }
}
