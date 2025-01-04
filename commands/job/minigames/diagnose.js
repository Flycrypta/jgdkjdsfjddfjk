import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { minigameConfigs } from '../../../config/jobConfig.js';

export class DiagnoseMinigame {
    constructor(level) {
        this.config = minigameConfigs.diagnose_issue;
        this.difficulty = this.config.difficulty[level - 1];
        this.sequence = this.generateSequence();
        this.playerSequence = [];
        this.timeLimit = this.config.timeLimit;
    }

    generateSequence() {
        const parts = ['engine', 'transmission', 'brakes', 'suspension', 'electrical'];
        const sequence = [];
        for (let i = 0; i < this.difficulty.steps; i++) {
            sequence.push(parts[Math.floor(Math.random() * parts.length)]);
        }
        return sequence;
    }

    createGameEmbed() {
        return new EmbedBuilder()
            .setTitle('🔧 Diagnose the Issue')
            .setDescription('Remember the sequence of problematic parts!')
            .addFields(
                { name: 'Difficulty', value: `Level ${this.difficulty}` },
                { name: 'Time Limit', value: `${this.timeLimit} seconds` }
            );
    }

    createButtons() {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('engine')
                .setLabel('Engine')
                .setStyle('Primary'),
            // ...more buttons for other parts
        );
    }

    checkAnswer(sequence) {
        const correct = sequence.every((part, index) => part === this.sequence[index]);
        const accuracy = sequence.filter((part, index) => part === this.sequence[index]).length / this.sequence.length;
        
        return {
            success: correct,
            accuracy,
            reward: correct ? this.difficulty.reward : 1.0
        };
    }
}
