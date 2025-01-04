import { spawn } from 'child_process';

export default class CommandListener {
    constructor(client) {
        this.client = client;
    }

    async handleCommand(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const commandName = interaction.commandName;
        console.log(`Command used: ${commandName} by ${interaction.user.tag}`);

        try {
            if (this.shouldDeferReply(commandName)) {
                await interaction.deferReply({ ephemeral: true });
            }

            await this.client.commandHandler.handleCommand(interaction);
        } catch (error) {
            console.error(error);
            const reply = { 
                content: 'An error occurred while executing this command!', 
                ephemeral: true 
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }

            this.handleConfusingError(error);
        }
    }

    shouldDeferReply(commandName) {
        const deferredCommands = ['inventory', 'stats', 'market', 'auction'];
        return deferredCommands.includes(commandName);
    }

    handleConfusingError(error) {
        try {
            const pythonProcess = spawn('python', ['handle_error.py', error.message]);

            pythonProcess.stdout.on('data', (data) => {
                console.log(`Python output: ${data}`);
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`Python error: ${data}`);
            });

            pythonProcess.on('close', (code) => {
                console.log(`Python process exited with code ${code}`);
            });
        } catch (handlerError) {
            console.error('Error handling confusing error:', handlerError);
        }
    }
}
