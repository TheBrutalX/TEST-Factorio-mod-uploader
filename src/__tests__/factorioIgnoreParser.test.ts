import { FactorioIgnoreParser } from '@services/FactorioIgnoreParser';
import { promises as fs } from 'fs';

jest.mock('@actions/core', () => ({
    warning: jest.fn(),
}));

jest.mock('fs', () => ({
    promises: {
        readdir: jest.fn(),
        mkdir: jest.fn(),
        stat: jest.fn(),
        copyFile: jest.fn(),
    },
}));

describe('FactorioIgnoreParser', () => {
    let parser: FactorioIgnoreParser;
    afterEach(() => {
        parser.clear();
    });

    describe('Constructor', () => {
        test('should initialize with default values and no custom rules', () => {
            parser = new FactorioIgnoreParser('');
            const expectedPatterns = (FactorioIgnoreParser as any).DEFAULT_PATTERNS;
            const parsedPatterns = parser.getPatterns();
            const parsedPatternsStr = parsedPatterns.map((p) => p.pattern);
            expect(parsedPatterns).toHaveLength(expectedPatterns.length);
            expect(parsedPatternsStr).toEqual(expectedPatterns);
        });

        test('should initialize with default values and custom rules', () => {
            parser = new FactorioIgnoreParser('*.data\n!important.log');
            const expectedPatterns = (FactorioIgnoreParser as any).DEFAULT_PATTERNS;
            const expectedPatternsCount = expectedPatterns.length + 2;
            const parsedPatterns = parser.getPatterns();
            expect(parsedPatterns).toHaveLength(expectedPatternsCount);
        });

        test('should initialize with custom rules only', () => {
            parser = new FactorioIgnoreParser('*.data\n!important.log', false);
            const parsedPatterns = parser.getPatterns();
            expect(parsedPatterns).toHaveLength(2);
        });

    });

    describe('Pattern Parsing', () => {
        it('should parse basic patterns', () => {
            parser = new FactorioIgnoreParser('test.txt\n*.js\n/dir/file.txt', false);
            expect(parser.getPatterns()).toHaveLength(3);
        });

        it('should ignore comments and empty lines', () => {
            parser = new FactorioIgnoreParser('# comment\n\ntest.txt\n  # another comment  \n  ', false);
            expect(parser.getPatterns()).toHaveLength(1);
        });

        it('should handle negated patterns', () => {
            parser = new FactorioIgnoreParser('*.txt\n!important.txt', false);
            expect(parser.shouldIgnore('test.txt')).toBeTruthy();
            expect(parser.shouldIgnore('important.txt')).toBeFalsy();
        });

        test('should be case-insensitive for pattern matching', () => {
            parser = new FactorioIgnoreParser('debug.log\nDebUg.Log\nDEBUG.LOG', false);
            expect(parser.shouldIgnore('debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('DEBUG.LOG')).toBeTruthy()
            expect(parser.shouldIgnore('Debug.Log')).toBeTruthy()
            expect(parser.getPatterns()).toHaveLength(1);
        });

        test("should remove unsupported characters from a .factorioignore line", () => {
            const parser = new FactorioIgnoreParser('');
            const sanitizePatternMethod = (parser as any).sanitizePattern;

            const patternsWithUnsupportedChars = [
                '@invalid^pattern',
                'file:name*?',
                '!important.log$',
                '/foo[bar]/baz',
                'file<with>special:chars.txt',
                'path\\to\\file.js',
                'test|file?.md',
                'file"name.css'
            ];

            const expectedSanitizedPatterns = [
                'invalidpattern',
                'filename*?',
                '!important.log',
                '/foobar/baz',
                'filewithspecialchars.txt',
                'path/to/file.js',
                'testfile?.md',
                'filename.css'
            ];

            const sanitizedPatterns = patternsWithUnsupportedChars.map(sanitizePatternMethod.bind(parser));
            expect(sanitizedPatterns).toHaveLength(expectedSanitizedPatterns.length);
            for (let i = 0; i < sanitizedPatterns.length; i++) {
                expect(sanitizedPatterns[i]).toEqual(expectedSanitizedPatterns[i]);
            }
        });

        test('should match only one rule if multiple are equal', () => {
            const rules = '**/logs\n**/logs';
            parser = new FactorioIgnoreParser(rules, false);
            expect(parser.getPatterns()).toHaveLength(1);
            expect(parser.shouldIgnore('logs/debug.log')).toBeTruthy()
        });

        test('should handle rules with \'_\' characters', () => {
            parser = new FactorioIgnoreParser('file_name.log', false);
            expect(parser.getPatterns()).toHaveLength(1);
            expect(parser.shouldIgnore('file_name.log')).toBeTruthy()
        });

        test('should handle rules with \'-\' characters', () => {
            parser = new FactorioIgnoreParser('file-name.log', false);
            expect(parser.getPatterns()).toHaveLength(1);
            expect(parser.shouldIgnore('file-name.log')).toBeTruthy()
        });

    });

    describe('Pattern Matching', () => {
        test('should match files with double asterisk prefix', () => {
            parser = new FactorioIgnoreParser('**/logs', false);
            expect(parser.shouldIgnore('logs/debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('logs/monday/foo.bar')).toBeTruthy()
            expect(parser.shouldIgnore('build/logs/debug.log')).toBeTruthy()
        });

        test('should match specific file in any directory depth', () => {
            parser = new FactorioIgnoreParser('**/logs/debug.log', false);
            expect(parser.shouldIgnore('logs/debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('build/logs/debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('logs/build/debug.log')).toBeFalsy()
        });

        test('should handle wildcard patterns', () => {
            parser = new FactorioIgnoreParser('*.log', false);
            expect(parser.shouldIgnore('debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('foo.log')).toBeTruthy()
            expect(parser.shouldIgnore('.log')).toBeTruthy()
            expect(parser.shouldIgnore('logs/debug.log')).toBeTruthy()
        });

        test('should handle negated patterns', () => {
            parser = new FactorioIgnoreParser('*.log\n!important.log', false);
            expect(parser.shouldIgnore('debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('trace.log')).toBeTruthy()
            expect(parser.shouldIgnore('important.log')).toBeFalsy()
            expect(parser.shouldIgnore('logs/important.log')).toBeFalsy()
        });

        test('should match files only in root when prefixed with slash', () => {
            parser = new FactorioIgnoreParser('/debug.log', false);
            expect(parser.shouldIgnore('debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('logs/debug.log')).toBeFalsy()
        });

        test('should match single character with question mark', () => {
            parser = new FactorioIgnoreParser('debug?.log', false);
            expect(parser.shouldIgnore('debug0.log')).toBeTruthy()
            expect(parser.shouldIgnore('debugg.log')).toBeTruthy()
            expect(parser.shouldIgnore('debug10.log')).toBeFalsy()
        });

        test('should match single character with multiple question mark', () => {
            parser = new FactorioIgnoreParser('debug??.log', false);
            expect(parser.shouldIgnore('debug00.log')).toBeTruthy()
            expect(parser.shouldIgnore('debug10.log')).toBeTruthy()
            expect(parser.shouldIgnore('debug010.log')).toBeFalsy()
        });

        test('should handle directory patterns', () => {
            parser = new FactorioIgnoreParser('logs/', false);
            expect(parser.shouldIgnore('logs/debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('logs/latest/foo.bar')).toBeTruthy()
            expect(parser.shouldIgnore('build/logs/foo.bar')).toBeTruthy()
            expect(parser.shouldIgnore('build/logs/latest/debug.log')).toBeTruthy()
        });

        test('should handle double asterisk in middle of pattern', () => {
            parser = new FactorioIgnoreParser('logs/**/debug.log', false);
            expect(parser.shouldIgnore('logs/debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('logs/monday/debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('logs/monday/pm/debug.log')).toBeTruthy()
        });

        test('should handle wildcards in directory names', () => {
            parser = new FactorioIgnoreParser('logs/*day/debug.log', false);
            expect(parser.shouldIgnore('logs/monday/debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('logs/tuesday/debug.log')).toBeTruthy()
            expect(parser.shouldIgnore('logs/latest/debug.log')).toBeFalsy()
        });

        test('should not handle the special pattern "**"', () => {
            parser = new FactorioIgnoreParser('**', false);
            expect(parser.getPatterns()).toHaveLength(0);
        });

        test('should manage both folders and files', () => {
            parser = new FactorioIgnoreParser('*.log', false);
            expect(parser.shouldIgnore('foo.log')).toBeTruthy()
            expect(parser.shouldIgnore('dev/foo.log')).toBeTruthy()
            expect(parser.shouldIgnore('log/foo.file')).toBeFalsy()
        });

        test('should ignore node_modules by default', () => {
            parser = new FactorioIgnoreParser('', true);
            expect(parser.shouldIgnore('node_modules/foo.log')).toBeTruthy()
        });

        test('should ignore **/test/**', () => {
            parser = new FactorioIgnoreParser('**/test/**', false);
            expect(parser.shouldIgnore('test')).toBeTruthy()
            expect(parser.shouldIgnore('test/')).toBeTruthy()
            expect(parser.shouldIgnore('test/foo')).toBeTruthy()
            expect(parser.shouldIgnore('foo/test')).toBeTruthy()
            expect(parser.shouldIgnore('foo/test/foo')).toBeTruthy()
        });

        test('should ignore ', () => {
            parser = new FactorioIgnoreParser('/build/', false);
            expect(parser.shouldIgnore('build')).toBeTruthy()
            expect(parser.shouldIgnore('build/')).toBeTruthy()
            expect(parser.shouldIgnore('build/foo')).toBeTruthy()
            expect(parser.shouldIgnore('foo/build')).toBeFalsy()
            expect(parser.shouldIgnore('foo/build/foo')).toBeFalsy()
        });

    });

    describe('Pattern priority', () => {
        test('should the last equal or opposite rule take priority', () => {
            const rules = '**/logs\n!**/logs\n**/logs';
            parser = new FactorioIgnoreParser(rules, false);
            expect(parser.getPatterns()).toHaveLength(1);
            expect(parser.shouldIgnore('logs/debug.log')).toBeTruthy()
        });
    });

    describe('File Operations', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should create the destination directory if it does not exist', async () => {
            fs.readdir = jest.fn().mockResolvedValueOnce(['file1.txt', 'file2.js']);
            fs.stat = jest.fn().mockResolvedValue({ isDirectory: () => false });
            fs.mkdir = jest.fn().mockResolvedValue(undefined);
            parser = new FactorioIgnoreParser('', false);
            await parser.copyNonIgnoredFiles('src', 'dest');
            expect(fs.mkdir).toHaveBeenCalledTimes(1);
        });

        it('should copy non-ignored files', async () => {
            fs.readdir = jest.fn().mockResolvedValue(['file1.txt', 'file2.js']);
            fs.mkdir = jest.fn().mockResolvedValue(undefined);
            fs.stat = jest.fn().mockResolvedValue({ isDirectory: () => false });
            fs.copyFile = jest.fn().mockResolvedValue(undefined);
            parser = new FactorioIgnoreParser('*.txt', false);
            const copiedFiles = await parser.copyNonIgnoredFiles('src', 'dest');
            expect(copiedFiles).toHaveLength(1);
        });

        it('should recursively copy files from subdirectories', async () => {
            fs.readdir = jest.fn()
                .mockResolvedValueOnce(['file1.js', 'subdir'])
                .mockResolvedValueOnce(['file2.txt', 'file3.js']);
            fs.mkdir = jest.fn().mockResolvedValue(undefined);
            fs.stat = jest.fn()
                .mockImplementation((path) => Promise.resolve({
                    isDirectory: () => path.endsWith('subdir')
                }));
            fs.copyFile = jest.fn().mockResolvedValue(undefined);

            parser = new FactorioIgnoreParser('*.txt', false);
            try {
                const copiedFiles = await parser.copyNonIgnoredFiles('src', 'dest');

                expect(Array.isArray(copiedFiles)).toBeTruthy();
                expect(copiedFiles).toHaveLength(2);
                expect(copiedFiles).toContain('src/file1.js');
                expect(copiedFiles).toContain('src/subdir/file3.js');
            } catch (error: Error | any) {
                expect((error as Error).message).toBe('');
            }
        });

        it('should handle errors during file operations', async () => {
            fs.readdir = jest.fn().mockRejectedValue(new Error('Read error'));
            parser = new FactorioIgnoreParser('', false);

            await expect(parser.copyNonIgnoredFiles('src', 'dest'))
                .rejects.toThrow('Read error');
        });

        it('should not copy ignored directory contents', async () => {
            fs.readdir = jest.fn()
                .mockResolvedValueOnce(['package.json', 'node_modules', 'src'])
                .mockResolvedValueOnce(['module1.js'])
                .mockResolvedValueOnce(['file1.js']);
            fs.mkdir = jest.fn().mockResolvedValue(undefined);
            fs.stat = jest.fn()
                .mockImplementation((path) => Promise.resolve({
                    isDirectory: () => path.endsWith('node_modules') || path.endsWith('src')
                }));
            fs.copyFile = jest.fn().mockResolvedValue(undefined);

            parser = new FactorioIgnoreParser('node_modules', false);
            try {
                const copiedFiles = await parser.copyNonIgnoredFiles('', 'dest');
                expect(copiedFiles).toHaveLength(2);
                expect(copiedFiles).toContain('package.json');
                expect(copiedFiles).toContain('src/file1.js');
            } catch (error) {
                expect((error as Error).message).toBe('');
            }
        });

        it('should not create empty directories', async () => {
            fs.readdir = jest.fn().mockResolvedValue(['file1.txt']);
            fs.mkdir = jest.fn().mockResolvedValue(undefined);

            parser = new FactorioIgnoreParser('*.txt', false);
            const copiedFiles = await parser.copyNonIgnoredFiles('src', 'dest');

            expect(copiedFiles).toHaveLength(0);
            expect(fs.mkdir).toHaveBeenCalledTimes(0);
        });
    });

    describe('Test for wiki examples', () => {
        test('Test for example usage', () => {
            const rules = `*.txt
/build/
!build/important.txt
**/tests/**`;
            parser = new FactorioIgnoreParser(rules, false);
            expect(parser.getPatterns()).toHaveLength(4);
            expect(parser.shouldIgnore('src/main.lua')).toBeFalsy();
            expect(parser.shouldIgnore('src/tests/test1.lua')).toBeTruthy();
            expect(parser.shouldIgnore('src/tests/data.json')).toBeTruthy();
            expect(parser.shouldIgnore('build/output.lua')).toBeTruthy();
            expect(parser.shouldIgnore('build/important.txt')).toBeFalsy();
            expect(parser.shouldIgnore('src/main.lua')).toBeFalsy();
        });
    });
});