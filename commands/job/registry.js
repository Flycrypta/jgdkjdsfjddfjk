import { jobs } from '../../config/gameData.js';
import { jobSpecializations, jobMinigames } from '../../config/jobConfig.js';

export const jobCommands = {
    [jobs.MECHANIC]: async (interaction, dbManager) => {
        const userId = interaction.user.id;
        const specialization = await dbManager.getJobSpecialization(userId, 'mechanic');
        const minigame = jobMinigames.mechanic[Math.floor(Math.random() * jobMinigames.mechanic.length)];
        
        // Run job with specialization bonuses
        const result = await dbManager.workJob(userId, 'mechanic', {
            specialization,
            minigame,
            bonuses: calculateSpecializationBonuses(specialization)
        });

        return `You ${getMinigameDescription(minigame)} and earned ${result.payout} coins and ${result.xp} XP!
                ${result.bonusDescription || ''}`;
    },

    [jobs.CHEF]: async (interaction, dbManager) => {
        const result = await dbManager.workJob(interaction.user.id, 'chef');
        return `You cooked up a storm and earned ${result.payout} coins and ${result.xp} XP`;
    },

    [jobs.SECURITY]: async (interaction, dbManager) => {
        const result = await dbManager.workJob(interaction.user.id, 'security');
        return `You protected valuable assets and earned ${result.payout} coins and ${result.xp} XP`;
    },

    [jobs.OFFICE_WORKER]: async (interaction, dbManager) => {
        const result = await dbManager.workJob(interaction.user.id, 'office_worker');
        return `You completed your office tasks and earned ${result.payout} coins and ${result.xp} XP`;
    },

    [jobs.REAL_ESTATE]: async (interaction, dbManager) => {
        const result = await dbManager.workJob(interaction.user.id, 'real_estate');
        return `You sold some properties and earned ${result.payout} coins and ${result.xp} XP`;
    },

    [jobs.DRIVER]: async (interaction, dbManager) => {
        const result = await dbManager.workJob(interaction.user.id, 'driver');
        return `You completed your deliveries and earned ${result.payout} coins and ${result.xp} XP`;
    },

    [jobs.FACTORY_WORKER]: async (interaction, dbManager) => {
        const result = await dbManager.workJob(interaction.user.id, 'factory_worker');
        return `You operated machinery and earned ${result.payout} coins and ${result.xp} XP`;
    },

    [jobs.DEALER]: async (interaction, dbManager) => {
        const result = await dbManager.workJob(interaction.user.id, 'car_dealer');
        return `You sold some cars and earned ${result.payout} coins and ${result.xp} XP`;
    },

    getMinigameDescription: (type) => {
        const descriptions = {
            diagnose_issue: 'diagnosed a complex engine problem',
            time_repairs: 'completed repairs in record time',
            part_matching: 'perfectly matched replacement parts',
            price_negotiation: 'negotiated an excellent deal',
            customer_satisfaction: 'made a customer very happy'
        };
        return descriptions[type] || 'completed your work';
    }
};

function calculateSpecializationBonuses(specialization) {
    if (!specialization) return {};
    
    const bonuses = {};
    const spec = jobSpecializations[specialization.type][specialization.path];
    
    spec.bonuses.forEach(bonus => {
        if (specialization.level >= bonus.level) {
            Object.assign(bonuses, bonus.effect);
        }
    });
    
    return bonuses;
}
