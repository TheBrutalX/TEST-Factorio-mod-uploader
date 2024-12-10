import { FactorioModCategoryType, FactorioModLicenseType, FactorioModTagType } from "@/types/FactorioTypes";

export interface IModInfo {
    description?: string;
    summary?: string;
    title?: string;
    sourceLink?: string;
    license?: FactorioModLicenseType;
    category?: FactorioModCategoryType;
    tags?: FactorioModTagType[];
}