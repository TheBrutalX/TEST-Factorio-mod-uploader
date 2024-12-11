import BaseProcess from "@phases/baseProcess";

class TestProcess extends BaseProcess {
    public test: string = '';
    parseInputs(): void {
        this.test = this.getInput('test_env_key', true);
    }

    async run(): Promise<void> {
        // Implementation not needed for tests
    }
}

describe('BaseProcess', () => {
    let phase: TestProcess;

    beforeEach(() => {
        phase = new TestProcess();
    });

    test('Using \'-\' as divider for enviroment variable', () => {
        process.env['test-env-key'] = 'test-value';
        phase.parseInputs();
        expect(phase.test).toBe('test-value');
    });
    test('Using \'_\' as divider for enviroment variable', () => {
        process.env['test_env_key'] = 'test-value';
        phase.parseInputs();
        expect(phase.test).toBe('test-value');
    });

    test('Using a mixed case as divider for enviroment variable', () => {
        process.env['test-env_key'] = 'test-value';
        phase.parseInputs();
        expect(phase.test).toBe('test-value');
    });
});
