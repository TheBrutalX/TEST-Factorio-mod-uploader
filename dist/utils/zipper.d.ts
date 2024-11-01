/**
 * Compresses the specified directory into a .zip file
 * @param sourceDir - Path to the directory to compress
 * @param outPath - Path where the .zip file should be saved
 */
export declare function zipDirectory(sourceDir: string, outPath: string): Promise<string>;
