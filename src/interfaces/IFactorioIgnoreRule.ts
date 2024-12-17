export interface IFactorioIgnoreRule {
    pattern: string;
    isNegated: boolean;
    regex: RegExp;
}