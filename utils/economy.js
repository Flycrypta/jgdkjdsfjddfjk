import { dbManager } from '../db/database.js';
import { advancedErrorHandler } from './index.js';

const JOBS = {
    MECHANIC: {
        name: 'Mechanic',
        baseSalary: 100,
        maxLevel: 50,
        levelMultiplier: 1.2,
        description: 'Fix cars and earn money',
        skills: ['repair', 'diagnostics', 'tuning'],
        levelRequirements: {
            xpBase: 100,
            xpMultiplier: 1.5
        }
    },
    RACER: {
        name: 'Street Racer',
        baseSalary: 150,
        maxLevel: 50,
        levelMultiplier: 1.3,
        description: 'Participate in street races',
        skills: ['driving', 'drifting', 'racing'],
        levelRequirements: {
            xpBase: 150,
            xpMultiplier: 1.6
        }
    },
    DEALER: {
        name: 'Car Dealer',
        baseSalary: 200,
        maxLevel: 50,
        levelMultiplier: 1.4,
        description: 'Buy and sell cars for profit',
        skills: ['negotiation', 'market knowledge', 'sales'],
        levelRequirements: {
            xpBase: 200,
            xpMultiplier: 1.7
        }
    }
};

const BANKING = {
    ACCOUNTS: {
        SAVINGS: {
            name: 'Savings Account',
            interestRate: 0.05,
            minBalance: 1000,
            maxBalance: 1000000,
            interestInterval: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        },
        CHECKING: {
            name: 'Checking Account',
            interestRate: 0.01,
            minBalance: 0,
            maxBalance: 100000,
            withdrawalLimit: 10000
        }
    },
    
    async createAccount(userId, accountType) {
        try {
            const account = {
                type: accountType,
                balance: 0,
                createdAt: Date.now(),
                lastInterestPaid: Date.now()
            };
            await dbManager.createBankAccount(userId, account);
            return account;
        } catch (error) {
            advancedErrorHandler.logError(error, { action: 'Create bank account', userId, accountType });
            throw error;
        }
    },

    async calculateInterest(userId, accountType) {
        try {
            const account = await dbManager.getBankAccount(userId, accountType);
            const accountConfig = this.ACCOUNTS[accountType];
            
            if (!account || !accountConfig) throw new Error('Invalid account');
            
            const timeSinceLastInterest = Date.now() - account.lastInterestPaid;
            if (timeSinceLastInterest >= accountConfig.interestInterval) {
                const interest = account.balance * accountConfig.interestRate;
                await dbManager.updateBankAccount(userId, accountType, {
                    balance: account.balance + interest,
                    lastInterestPaid: Date.now()
                });
                return interest;
            }
            return 0;
        } catch (error) {
            advancedErrorHandler.logError(error, { action: 'Calculate interest', userId, accountType });
            throw error;
        }
    }
};

const JOB_SYSTEM = {
    async work(userId, jobType) {
        try {
            const userJob = await dbManager.getUserJob(userId, jobType);
            if (!userJob) throw new Error('User does not have this job');

            const job = JOBS[jobType];
            const salary = this.calculateSalary(job, userJob.level);
            const xpGained = this.calculateXpGain(job, userJob.level);

            // Update user's job experience and check for level up
            const { newLevel, leveledUp } = this.checkLevelUp(job, userJob.level, userJob.xp + xpGained);
            
            await dbManager.updateUserJob(userId, jobType, {
                level: newLevel,
                xp: userJob.xp + xpGained,
                lastWorked: Date.now()
            });

            await BANKING.addBalance(userId, salary);

            return {
                salary,
                xpGained,
                leveledUp,
                newLevel
            };
        } catch (error) {
            advancedErrorHandler.logError(error, { action: 'Work job', userId, jobType });
            throw error;
        }
    },

    calculateSalary(job, level) {
        return Math.floor(job.baseSalary * Math.pow(job.levelMultiplier, level - 1));
    },

    calculateXpGain(job, level) {
        return Math.floor(job.levelRequirements.xpBase * Math.pow(job.levelRequirements.xpMultiplier, level - 1));
    },

    checkLevelUp(job, currentLevel, totalXp) {
        if (currentLevel >= job.maxLevel) return { newLevel: currentLevel, leveledUp: false };

        const xpNeeded = this.calculateXpNeeded(job, currentLevel);
        if (totalXp >= xpNeeded) {
            return { newLevel: currentLevel + 1, leveledUp: true };
        }

        return { newLevel: currentLevel, leveledUp: false };
    },

    calculateXpNeeded(job, level) {
        return Math.floor(job.levelRequirements.xpBase * Math.pow(job.levelRequirements.xpMultiplier, level));
    }
};

const JOB_REWARDS = {
    driver: {
        baseReward: 500,
        experienceMultiplier: 1.1,
        cooldown: 3600000 // 1 hour
    },
    mechanic: {
        baseReward: 600,
        experienceMultiplier: 1.2,
        cooldown: 3600000
    }
    // Add more jobs
};

const LEVEL_REQUIREMENTS = {
    2: 1000,
    3: 2500,
    4: 5000,
    // Add more levels
};

const calculateJobReward = (job, userLevel, jobExperience) => {
    const baseReward = JOB_REWARDS[job].baseReward;
    const levelMultiplier = 1 + (userLevel * 0.1);
    const experienceMultiplier = 1 + (jobExperience * 0.001);
    
    return Math.floor(baseReward * levelMultiplier * experienceMultiplier);
};

const calculateTradeRisk = (user1, user2, amount) => {
    return {
        isSafe: user1.level > 5 && user2.level > 5 && amount < 1000000,
        requiresMiddleman: amount > 1000000
    };
};

module.exports = {
    JOB_REWARDS,
    LEVEL_REQUIREMENTS,
    calculateJobReward,
    calculateTradeRisk
};

export { JOBS, BANKING, JOB_SYSTEM };
