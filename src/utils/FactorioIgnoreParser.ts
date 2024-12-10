import { FACTORIOIGNORE_FILE_NAME } from "@/constants";
import { IFactorioIgnoreRule } from "@/interfaces/IFactorioIgnoreRule";

export class FactorioIgnoreParser {
    private patterns: Array<IFactorioIgnoreRule> = [];
    constructor(content: string) {
        this.setDefaultPatterns();
        if(content) {
            this.parseContent(content);
        }
    }

    public parseContent(content: string): void {
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) continue;
            this.addPattern(trimmedLine);
        }
    }

    private addPattern(pattern: string): void {
        const negated = pattern.startsWith('!');
        pattern = negated ? pattern.slice(1) : pattern;
        // Handle directory-specific patterns (those ending with /)
        const isDirectory = pattern.endsWith('/');
        pattern = isDirectory ? pattern.slice(0, -1) : pattern;
        // Convert the gitignore pattern to a regular expression
        let regexPattern = pattern
        // Escape special regex characters except * and ?
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        // Convert gitignore wildcards to regex wildcards
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.')
        // Handle double asterisk for matching across directories
            .replace(/\.\*\.\*/g, '.*');
        // If the pattern doesn't start with /, it can match in any directory
        if (!pattern.startsWith('/')) {
            regexPattern = `(.*/)?${regexPattern}`;
        } else {
            regexPattern = regexPattern.slice(1); // Remove leading /
        }
        // If it's a directory pattern, it should match the full path
        if (isDirectory) {
            regexPattern = `${regexPattern}(?:/.*)?`;
        }
        // Create the final regex with proper anchors
        const regex = new RegExp(`^${regexPattern}$`);
        const newRule = {
            pattern : pattern,
            negated : negated,
            isDirectory : isDirectory,
            regex : regex
        };
        // Check if the pattern already exists
        const existingRule = this.patterns.find(r => r.pattern === newRule.pattern);
        if (existingRule) {
            // If the existing rule is a directory rule, replace it
            if (existingRule.isDirectory) {
                this.patterns[this.patterns.indexOf(existingRule)] = newRule;
            } else {
                // If the new rule is a directory rule, ignore it
                if (!newRule.isDirectory) {
                    // If the existing rule is negated, replace it
                    if (existingRule.negated) {
                        this.patterns[this.patterns.indexOf(existingRule)] = newRule;
                    }
                }
            }
            return;
        } else {
            this.patterns.push(newRule);
        }
    }

    // Check if a path should be ignore
    // Used in test cases
    public shouldIgnore(path: string): boolean {
        // Normalize the path to use forward slashes and remove leading ./
        path = path.replace(/\\/g, '/').replace(/^\.\//, '');
        let shouldIgnore = false;
        // Check each pattern in order
        for (const { regex, negated } of this.patterns) {
            if (regex.test(path)) {
            shouldIgnore = !negated;
            }
        }
        return shouldIgnore;
    }

    public getPatterns(): Array<IFactorioIgnoreRule> {
        return [...this.patterns];
    }

    public clear(): void {
        this.patterns = [];
    }

    public async copyNonIgnoredFiles(
        sourcePath: string,
        destPath: string,
        fs: {
            readdir: (path: string, options: { recursive: boolean }) => Promise<string[]>;
            mkdir: (path: string, options: { recursive: boolean }) => Promise<string | undefined>;
            copyFile: (src: string, dest: string) => Promise<void>;
            stat: (path: string) => Promise<{ isDirectory: () => boolean }>;
            normalize: (path: string) => string;
        }
    ): Promise<string[]> {
        // Ensure the destination directory exists
        const normalizedDestPath = fs.normalize(destPath);
        await fs.mkdir(normalizedDestPath, { recursive: true });
        // Get all files recursively
        const allFiles = await fs.readdir(sourcePath, { recursive: true });
        const copiedFiles: string[] = [];
        for (const relativePath of allFiles) {
            const relativePathNormalized = fs.normalize(relativePath);
          // Skip if the file should be ignored
            if (this.shouldIgnore(relativePathNormalized)) {
                continue;
            }
        
            const sourceFilePath = `${sourcePath}/${relativePathNormalized}`;
            const sourceFileNormalized = fs.normalize(sourceFilePath);
            const destFilePath = `${destPath}/${relativePathNormalized}`;
            const destFilePathNormalized = fs.normalize(destFilePath);
        
            // Create parent directory if it doesn't exist
            const parentDir = destFilePathNormalized.substring(0, destFilePath.lastIndexOf('/'));
            await fs.mkdir(parentDir, { recursive: true });
        
            // Check if it's a directory
            const stats = await fs.stat(sourceFileNormalized);
            if (!stats.isDirectory()) {
                // Copy the file
                await fs.copyFile(sourceFileNormalized, destFilePathNormalized);
                copiedFiles.push(relativePathNormalized);
            }
        }
    
        return copiedFiles;
    }

    public setDefaultPatterns(): void {
        this.clear();
        this.addPattern(FACTORIOIGNORE_FILE_NAME); // Ignore factorioignore file
        this.addPattern('.git/'); // Ignore git directory
        this.addPattern('.github/'); // Ignore github directory
        this.addPattern('.gitignore'); // Ignore gitignore file
        this.addPattern('.log'); // Ignore log files
        this.addPattern('.tmp'); // Ignore tmp directory
        this.addPattern('.vscode/'); // Ignore vscode directory
        this.addPattern('*.bak'); // Ignore backup files
        this.addPattern('*.tmp'); // Ignore tmp files
        this.addPattern('*.tmp.*'); // Ignore tmp files
    }
}