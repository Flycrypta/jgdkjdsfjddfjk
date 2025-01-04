export const bankingConfig = {
    creditCards: {
        starter: { name: "Basic Starter Card", limit: 500, interestRate: 0.2499, monthlyFee: 0, rewards: { cashback: 0.01, maxCashbackPerMonth: 50, categories: [] }, requirements: { creditScore: 300, income: 1000 } },
        rewards: { name: "Daily Rewards Card", limit: 2500, interestRate: 0.1999, monthlyFee: 5, rewards: { cashback: 0.02, maxCashbackPerMonth: 100, categories: { groceries: 0.03, gas: 0.03 } }, requirements: { creditScore: 580, income: 2000 } },
        premium: { name: "Premium Rewards Plus", limit: 10000, interestRate: 0.1599, monthlyFee: 95, rewards: { cashback: 0.03, maxCashbackPerMonth: 500, categories: { dining: 0.04, travel: 0.04, entertainment: 0.04 }, bonuses: { travelCredit: 300, globalEntryCredit: 100 } }, requirements: { creditScore: 720, income: 5000 } },
        business: { name: "Business Rewards Elite", limit: 25000, interestRate: 0.1499, monthlyFee: 150, rewards: { cashback: 0.02, maxCashbackPerMonth: 1000, categories: { office: 0.05, advertising: 0.05, shipping: 0.05 }, bonuses: { yearEndBonus: 0.01 } }, requirements: { creditScore: 700, businessRevenue: 100000 } },
        luxury: { name: "Luxury Black Card", limit: 50000, interestRate: 0.1299, monthlyFee: 495, rewards: { cashback: 0.05, maxCashbackPerMonth: 2000, categories: { travel: 0.10, dining: 0.10, luxury: 0.10 }, bonuses: { airportLounge: true, conciergeService: true, hotelUpgrades: true, yearEndBonus: 0.02 } }, requirements: { creditScore: 760, income: 250000, netWorth: 1000000 } }
    },
    loans: {
        personal: {
            minAmount: 1000,
            maxAmount: 50000,
            baseRate: 0.0699,
            maxTerm: 60, // months
            requirements: {
                creditScore: 640,
                income: 3000,
                employmentMonths: 6
            }
        },
        business: {
            minAmount: 10000,
            maxAmount: 500000,
            interestRate: 0.08,    // 8% APR
            maxTerm: 60            // months
        },
        auto: {
            minAmount: 5000,
            maxAmount: 100000,
            interestRate: 0.06,    // 6% APR
            maxTerm: 72            // months
        }
    },
    savings: {
        basic: {
            interestRate: 0.02,
            minimumBalance: 100
        },
        premium: {
            interestRate: 0.04,
            minimumBalance: 10000
        }
    },
    accounts: {
        savings: {
            interestRate: 0.05,    // 5% APY
            minBalance: 1000,
            maxBalance: 1000000,
            withdrawalLimit: 10000
        },
        checking: {
            interestRate: 0.01,    // 1% APY
            minBalance: 0,
            maxBalance: 100000,
            withdrawalLimit: 5000
        },
        business: {
            interestRate: 0.03,    // 3% APY
            minBalance: 5000,
            maxBalance: 5000000,
            withdrawalLimit: 50000
        }
    },
    investments: {
        stocks: {
            tradingFee: 0.01,      // 1% per trade
            minInvestment: 100,
            maxInvestment: 1000000
        },
        crypto: {
            tradingFee: 0.02,      // 2% per trade
            minInvestment: 50,
            maxInvestment: 500000
        }
    },
    vipLevels: {
        bronze: { requirement: 10000, benefits: ['reduced fees', 'higher limits'] },
        silver: { requirement: 50000, benefits: ['premium support', 'special rates'] },
        gold: { requirement: 100000, benefits: ['personal banker', 'exclusive deals'] }
    }
};
