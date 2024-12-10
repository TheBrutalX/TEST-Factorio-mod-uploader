export interface IFactorioIgnoreRule {
    pattern: string;
    negated: boolean;
    isDirectory: boolean;
    regex: RegExp;
}