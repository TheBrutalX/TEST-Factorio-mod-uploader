import { FactorioModCategoryType, FactorioModLicenseType } from "@/types/IFactorioTypes";

export interface IModInfoCreate {
    modName: string;
    description?: string;
    categories?: FactorioModCategoryType[];
    license?: FactorioModLicenseType;
    sourceUrl?: string;
}