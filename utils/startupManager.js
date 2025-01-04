import chalk from 'chalk';
import { Logger } from './logger.js';
import { createSpinner } from 'nanospinner';

class StartupManager {
    constructor() {
        this.logger = new Logger('Startup');
        this.startTime = Date.now();
        this.commandStatus = new Map();
        this.steps = [];
        this.currentSpinner = null;
    }

    async startStep(stepName) {
        const spinner = createSpinner(chalk.blue(`${stepName}...`)).start();
        this.currentSpinner = { spinner, stepName };
        this.steps.push({ name: stepName, status: 'pending' });
    }

    async completeStep(success = true, error = null) {
        if (this.currentSpinner) {
            const { spinner, stepName } = this.currentSpinner;
            const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

            if (success) {
                spinner.success({
                    text: chalk.green(`✓ ${stepName} (${duration}s)`)
                });
            } else {
                spinner.error({
                    text: chalk.red(`✗ ${stepName} (${duration}s)`)
                });
                this.logger.error(`Failed at ${stepName}:`, error);
            }

            this.steps[this.steps.length - 1].status = success ? 'success' : 'failed';
            this.steps[this.steps.length - 1].error = error;
            this.currentSpinner = null;
        }
    }

    drawBox(content) {
        const lines = content.split('\n');
        const width = Math.max(...lines.map(line => line.length)) + 2;
        const horizontal = '─'.repeat(width);
        
        console.log(chalk.cyan(`┌${horizontal}┐`));
        lines.forEach(line => {
            const padding = ' '.repeat(width - line.length - 2);
            console.log(chalk.cyan('│ ') + line + padding + chalk.cyan(' │'));
        });
        console.log(chalk.cyan(`└${horizontal}┘`));
    }

    summarizeStartup() {
        const totalCommands = this.commandStatus.size;
        const successfulCommands = Array.from(this.commandStatus.values())
            .filter(status => status.success).length;

        const summary = [
            chalk.bold('Startup Summary:'),
            '---------------',
            `Total Commands: ${totalCommands}`,
            `Successfully Loaded: ${chalk.green(successfulCommands)}`,
            `Failed: ${chalk.red(totalCommands - successfulCommands)}`,
            '',
            chalk.bold('Startup Steps:'),
            '---------------',
            ...this.steps.map(step => {
                const icon = step.status === 'success' ? chalk.green('✓') : chalk.red('✗');
                const error = step.error ? chalk.red(`\n  Error: ${step.error.message}`) : '';
                return `${icon} ${step.name}${error}`;
            })
        ].join('\n');

        this.drawBox(summary);
    }

    trackCommandLoad(commandName, success, error = null) {
        this.commandStatus.set(commandName, { success, error });
    }

    logStartupTime(startTime) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`Startup completed in ${duration}ms`);
    }
}

export const startupManager = new StartupManager();
