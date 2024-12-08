//#region Categories

import { warning } from "@actions/core";

export type FactorioModCategoryType = 
    | "no-category"
    | "content"
    | "overhaul"
    | "tweaks"
    | "utilities"
    | "scenarios"
    | "mod-packs"
    | "localizations"
    | "internal";

export const FactorioModCategory: FactorioModCategoryType[] = [
    "no-category",
    "content",
    "overhaul",
    "tweaks",
    "utilities",
    "scenarios",
    "mod-packs",
    "localizations",
    "internal"
];

export function ValidateFactorioCategory(category: string): FactorioModCategoryType | void {
    if(FactorioModCategory.includes(category.toLocaleLowerCase() as FactorioModCategoryType)) {
        return category as FactorioModCategoryType;
    }
    warning(`Invalid category: ${category} - skipping`);
}

export function ValidateFactorioCategories(categories: string[]): FactorioModCategoryType[] {
    return categories.map((category) => {
        return ValidateFactorioCategory(category);
    }).filter((category) => {
        return category !== undefined;
    }) as FactorioModCategoryType[];
}

//#endregion Categories


export type FactorioModTagType = 
    | "transportation"
    | "logistics"
    | "pipes"
    | "trains"
    | "combat"
    | "armor"
    | "enemies"
    | "environment"
    | "mining"
    | "fluids"
    | "logistic"
    | "circuit"
    | "manufacturing"
    | "power"
    | "storage"
    | "blueprints"
    | "cheats";

export const FactorioModTags: FactorioModTagType[] = [
    "transportation",
    "logistics",
    "pipes",
    "trains",
    "combat",
    "armor",
    "enemies",
    "environment",
    "mining",
    "fluids",
    "logistic",
    "circuit",
    "manufacturing",
    "power",
    "storage",
    "blueprints",
    "cheats"
];

//#region License

export type FactorioModLicenseType = 
    | "default_mit"
    | "default_gnugplv3"
    | "default_gnulgplv3"
    | "default_mozilla2"
    | "default_apache2"
    | "default_unlicense"

export const FactorioLicenses: FactorioModLicenseType[] = [
    "default_mit",
    "default_gnugplv3",
    "default_gnulgplv3",
    "default_mozilla2",
    "default_apache2",
    "default_unlicense"
];

export function ValidateFactorioLicense(license: string): FactorioModLicenseType {
    if(FactorioLicenses.includes(license.toLocaleLowerCase() as FactorioModLicenseType) || license.toLocaleLowerCase().startsWith('custom_')) {
        return license as FactorioModLicenseType;
    }
    throw new Error('Invalid license');
}

//#endregion License