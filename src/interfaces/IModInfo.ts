import { FactorioModCategoryType, FactorioModLicenseType } from "@/types/IFactorioTypes";

export interface IModInfo {
    mod_info:{
        description_file?: string;
        attach_source_link?: true | false;
        license?: FactorioModLicenseType;
        categories?: FactorioModCategoryType[];
        tags?: string[];
    }
}
