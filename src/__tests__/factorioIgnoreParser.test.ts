import { FactorioIgnoreParser } from '@services/FactorioIgnoreParser';
jest.mock('@actions/core', () => {
    return {
        debug: jest.fn(),
        error: jest.fn(),
        exportVariable: jest.fn(),
        getInput: jest.fn(),
        info: jest.fn(),
        setFailed: jest.fn(),
        warning: jest.fn()
    }
});

describe('FactorioIgnoreParser', () => {
    let parser: FactorioIgnoreParser;

    beforeEach(() => {
        parser = new FactorioIgnoreParser('');
    });

    describe('Constructor & Basic Functions', () => {
        it('should initialize with default patterns', () => {
            expect(parser.getPatterns()).toHaveLength(10);
        });

        it('should clear patterns', () => {
            parser.clear();
            expect(parser.getPatterns()).toHaveLength(0);
        });
    });

    describe('Pattern Parsing', () => {
        it('should parse basic patterns', () => {
            parser.clear();
            parser.parseContent('test.txt\n*.js\n/dir/file.txt');
            expect(parser.getPatterns()).toHaveLength(3);
        });

        it('should ignore comments and empty lines', () => {
            parser.clear();
            parser.parseContent('# comment\n\ntest.txt\n  # another comment  \n  ');
            expect(parser.getPatterns()).toHaveLength(1);
        });

        it('should handle negated patterns', () => {
            parser.clear();
            parser.parseContent('*.txt\n!important.txt');
            expect(parser.shouldIgnore('test.txt')).toBeTruthy();
            expect(parser.shouldIgnore('important.txt')).toBeFalsy();
        });
    });

    describe('Pattern Matching', () => {
        it('should match simple file patterns', () => {
            parser.clear();
            parser.parseContent('test.txt');
            expect(parser.shouldIgnore('test.txt')).toBeTruthy();
            expect(parser.shouldIgnore('other.txt')).toBeFalsy();
        });

        it('should match wildcard patterns', () => {
            parser.clear();
            parser.parseContent('*.txt');
            expect(parser.shouldIgnore('test.txt')).toBeTruthy();
            expect(parser.shouldIgnore('test.js')).toBeFalsy();
        });

        it('should match directory patterns', () => {
            parser.clear();
            parser.parseContent('dir/');
            expect(parser.shouldIgnore('dir/file.txt')).toBeTruthy();
            expect(parser.shouldIgnore('dir')).toBeTruthy();
            expect(parser.shouldIgnore('other/file.txt')).toBeFalsy();
        });

        it('should match patterns with double asterisk', () => {
            parser.clear();
            parser.parseContent('**/test');
            expect(parser.shouldIgnore('dir/test')).toBeTruthy();
            expect(parser.shouldIgnore('dir/subdir/test')).toBeTruthy();
        });
    });

    describe('Pattern Priority', () => {
        it('should handle pattern overrides', () => {
            parser.clear();
            parser.parseContent('/test/\ntest');
            const patterns = parser.getPatterns();
            expect(patterns).toHaveLength(2);
            expect(patterns[0].isDirectory).toBeTruthy();
        });

        it('should handle negated pattern overrides', () => {
            parser.clear();
            parser.parseContent('test\n!test');
            const patterns = parser.getPatterns();
            expect(patterns).toHaveLength(1);
            expect(patterns[0].negated).toBeTruthy();
        });
    });

    describe('File Operations', () => {
        const mockFs = {
            readdir: jest.fn(),
            mkdir: jest.fn(),
            copyFile: jest.fn(),
            stat: jest.fn(),
            normalize: (path: string) => path
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should copy non-ignored files', async () => {
            mockFs.readdir.mockResolvedValue(['file1.txt', 'file2.js']);
            mockFs.stat.mockResolvedValue({ isDirectory: () => false });
            mockFs.mkdir.mockResolvedValue(undefined);

            const copiedFiles = await parser.copyNonIgnoredFiles('src', 'dest', mockFs);
            expect(copiedFiles).toHaveLength(2);
            expect(mockFs.copyFile).toHaveBeenCalledTimes(2);
        });

        it('should skip ignored files during copy', async () => {
            parser.clear();
            parser.parseContent('*.txt');
            mockFs.readdir.mockResolvedValue(['file1.txt', 'file2.js']);
            mockFs.stat.mockResolvedValue({ isDirectory: () => false });

            const copiedFiles = await parser.copyNonIgnoredFiles('src', 'dest', mockFs);
            expect(copiedFiles).toHaveLength(1);
            expect(mockFs.copyFile).toHaveBeenCalledTimes(1);
        });
    });
});