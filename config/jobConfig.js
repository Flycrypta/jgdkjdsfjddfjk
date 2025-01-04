export const jobSpecializations = {
    mechanic: {
        diagnostics: {
            levels: 5,
            bonuses: [
                { level: 1, effect: { efficiency: 5 } },
                { level: 3, effect: { income: 10 } },
                { level: 5, effect: { special: 'master_diagnostic' } }
            ]
        },
        restoration: {
            levels: 5,
            bonuses: [
                { level: 1, effect: { quality: 5 } },
                { level: 3, effect: { income: 15 } },
                { level: 5, effect: { special: 'restoration_expert' } }
            ]
        },
        performance: {
            levels: 5,
            bonuses: [
                { level: 1, effect: { tuning: 5, income: 5 } },
                { level: 3, effect: { special: 'dyno_master', income: 15 } },
                { level: 5, effect: { special: 'race_tuner', income: 25 } }
            ],
            tools: ['dyno_machine', 'ecu_programmer', 'boost_controller']
        },
        bodywork: {
            levels: 5,
            bonuses: [
                { level: 1, effect: { aesthetics: 5, income: 5 } },
                { level: 3, effect: { special: 'paint_expert', income: 15 } },
                { level: 5, effect: { special: 'custom_king', income: 25 } }
            ],
            tools: ['paint_booth', 'body_kit_tools', 'vinyl_cutter']
        }
    },
    dealer: {
        sales: {
            levels: 5,
            bonuses: [
                { level: 1, effect: { charisma: 5 } },
                { level: 3, effect: { income: 20 } },
                { level: 5, effect: { special: 'master_negotiator' } }
            ]
        },
        imports: {
            levels: 5,
            bonuses: [
                { level: 1, effect: { foreign_market: 5, income: 10 } },
                { level: 3, effect: { special: 'jdm_expert', income: 20 } },
                { level: 5, effect: { special: 'international_dealer', income: 30 } }
            ]
        },
        luxury: {
            levels: 5,
            bonuses: [
                { level: 1, effect: { high_end: 5, income: 15 } },
                { level: 3, effect: { special: 'luxury_expert', income: 25 } },
                { level: 5, effect: { special: 'elite_dealer', income: 40 } }
            ]
        }
    }
};

export const jobMinigames = {
    mechanic: ['diagnose_issue', 'time_repairs', 'part_matching'],
    dealer: ['price_negotiation', 'customer_satisfaction'],
    // Add more minigames for other jobs
};

export const minigameConfigs = {
    diagnose_issue: {
        type: 'sequence',
        timeLimit: 60,
        difficulty: [
            { level: 1, steps: 3, reward: 1.1 },
            { level: 2, steps: 4, reward: 1.2 },
            { level: 3, steps: 5, reward: 1.3 }
        ]
    },
    time_repairs: {
        type: 'quicktime',
        sequences: ['up', 'down', 'left', 'right'],
        timeLimit: 30,
        bonusThreshold: 0.8
    },
    price_negotiation: {
        type: 'bargain',
        rounds: 3,
        customerTypes: ['easy', 'medium', 'hard'],
        bonusThresholds: [0.9, 0.95, 0.98]
    }
};

export const jobAchievements = {
    mechanic: {
        repair_master: {
            id: 'repair_100',
            name: 'Master Mechanic',
            description: 'Complete 100 repairs',
            reward: { coins: 5000, xp: 1000 }
        },
        perfect_diagnosis: {
            id: 'perfect_diag_50',
            name: 'Perfect Diagnostician',
            description: 'Get 50 perfect diagnoses',
            reward: { coins: 10000, xp: 2000, special: 'diagnostic_tool' }
        }
    }
};

export const specializationTools = {
    dyno_machine: {
        name: 'Dynamometer',
        cost: 25000,
        effect: { tuning_bonus: 20, accuracy: 15 }
    },
    paint_booth: {
        name: 'Professional Paint Booth',
        cost: 35000,
        effect: { quality: 25, speed: 15 }
    }
    // ...more tools
};
