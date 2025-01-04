import { creditCards } from './config/gameData.js';

const bankingSystem = {
    creditCards: creditCards,
    processApplication: async (userId, cardType) => {
        const card = creditCards[cardType];
        if (!card) return { success: false, message: 'Invalid card type' };
        // Add credit check logic here
        return { success: true, card };
    }
};

const homes = {
    small: { price: 50000, security: 1, storage: 100000 },
    medium: { price: 150000, security: 2, storage: 300000 },
    mansion: { price: 500000, security: 3, storage: 1000000 }
};

const loans = {
    maxAmount: 1000000,
    interestRate: 0.05,
    paymentPeriod: 30 // days
};

async function applyForLoan(userId, amount) {
    if (amount > loans.maxAmount) return { success: false, message: 'Loan amount too high' };
    // Add loan to user's account
    const interest = amount * loans.interestRate;
    return { success: true, amount, interest, total: amount + interest };
}

async function buyHome(userId, homeType) {
    if (!homes[homeType]) return { success: false, message: 'Invalid home type' };
    const home = homes[homeType];
    // Check if user can afford
    return { success: true, home };
}

async function robHome(robberId, victimId) {
    const chance = Math.random();
    const securityLevel = 0.3; // Basic security level
    
    if (chance > securityLevel) {
        // Successful robbery
        return { success: true, amount: Math.floor(Math.random() * 10000) };
    }
    return { success: false, message: 'Failed to rob home' };
}

// Initialize homes array for adminspin
if (!adminspin.homes) {
    adminspin.homes = [];
}

// Example function calls
async function testBankingSystem() {
    const userId = "123";
    const robberId = "456";
    
    // Test existing functions
    const loanResult = await applyForLoan(userId, 5000);
    const homeResult = await buyHome(userId, "small");
    const robberyResult = await robHome(robberId, userId);
}

// New suggested functions:

async function applyForCreditCard(userId, cardType) {
    if (!creditCards[cardType]) return { success: false, message: 'Invalid card type' };
    return { success: true, card: creditCards[cardType] };
}

async function makePayment(userId, amount) {
    return { success: true, amount };
}

async function transferMoney(fromId, toId, amount) {
    return { success: true, amount };
}

async function checkBalance(userId) {
    return { balance: Math.floor(Math.random() * 10000) };
}

// Investment System
const stocks = {
    APPLE: { price: 150, volatility: 0.1 },
    GOOGLE: { price: 2500, volatility: 0.15 },
    TESLA: { price: 800, volatility: 0.25 }
};

const crypto = {
    BTC: { price: 30000, volatility: 0.3 },
    ETH: { price: 2000, volatility: 0.25 }
};

const businesses = {
    shop: { cost: 50000, income: 1000 },
    restaurant: { cost: 100000, income: 2500 },
    factory: { cost: 500000, income: 10000 }
};

const jobs = {
    clerk: { salary: 1000, requirements: 0 },
    manager: { salary: 3000, requirements: 5 },
    executive: { salary: 10000, requirements: 10 }
};

const { updateBalance, addTransaction, getUserAssets } = require('./database');

async function investInStock(userId, stockName, amount) {
    if (!stocks[stockName]) return { success: false, message: 'Invalid stock' };
    const userAssets = await getUserAssets(userId);
    
    if (userAssets.balance < amount) {
        return { success: false, message: 'Insufficient funds' };
    }

    const shares = amount / stocks[stockName].price;
    await updateBalance(userId, -amount);
    await addTransaction(userId, 'stock_purchase', -amount);
    
    // Update user's stock portfolio
    userAssets.stocks[stockName] = (userAssets.stocks[stockName] || 0) + shares;
    
    return { success: true, shares, stockName };
}

async function tradeCrypto(userId, cryptoName, amount, isBuying) {
    if (!crypto[cryptoName]) return { success: false, message: 'Invalid cryptocurrency' };
    const quantity = amount / crypto[cryptoName].price;
    return { success: true, quantity, cryptoName, type: isBuying ? 'buy' : 'sell' };
}

async function startBusiness(userId, businessType) {
    if (!businesses[businessType]) return { success: false, message: 'Invalid business type' };
    
    const userAssets = await getUserAssets(userId);
    const business = businesses[businessType];
    
    if (userAssets.balance < business.cost) {
        return { success: false, message: 'Insufficient funds' };
    }

    await updateBalance(userId, -business.cost);
    await addTransaction(userId, 'business_purchase', -business.cost);
    userAssets.businesses.push({
        type: businessType,
        purchaseDate: new Date().toISOString(),
        dailyIncome: business.income
    });

    return { success: true, business };
}

// Add daily income calculation for businesses
async function processBusinessIncome(userId) {
    const userAssets = await getUserAssets(userId);
    let totalIncome = 0;

    for (const business of userAssets.businesses) {
        totalIncome += business.dailyIncome;
    }

    if (totalIncome > 0) {
        await updateBalance(userId, totalIncome);
        await addTransaction(userId, 'business_income', totalIncome);
    }

    return { success: true, income: totalIncome };
}

// Process job salary
async function processSalary(userId) {
    const userAssets = await getUserAssets(userId);
    if (!userAssets.job) return { success: false, message: 'No job' };

    const salary = jobs[userAssets.job].salary;
    await updateBalance(userId, salary);
    await addTransaction(userId, 'salary', salary);

    return { success: true, amount: salary };
}

async function applyForJob(userId, jobType) {
    if (!jobs[jobType]) return { success: false, message: 'Invalid job type' };
    return { success: true, job: jobs[jobType] };
}

async function calculateMortgage(principal, rate, years) {
    const monthlyRate = rate / 12;
    const months = years * 12;
    const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return { monthlyPayment: payment, totalPayment: payment * months };
}

async function processTransaction(userId, type, amount) {
    const transaction = {
        id: Date.now(),
        userId,
        type,
        amount,
        timestamp: new Date().toISOString()
    };
    return { success: true, transaction };
}

async function calculateCreditScore(userId) {
    // Basic credit score calculation
    const baseScore = 300;
    const maxScore = 850;
    const randomScore = Math.floor(Math.random() * (maxScore - baseScore)) + baseScore;
    return { score: randomScore };
}

async function createSavingsGoal(userId, name, targetAmount) {
    return {
        success: true,
        goal: {
            name,
            targetAmount,
            currentAmount: 0,
            createdAt: new Date().toISOString()
        }
    };
}

async function detectFraud(transaction) {
    const suspiciousAmount = 10000;
    const isSuspicious = transaction.amount > suspiciousAmount;
    return { isFraudulent: isSuspicious };
}

async function exchangeCurrency(amount, fromCurrency, toCurrency) {
    const rates = {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110
    };
    
    const convertedAmount = amount * (rates[toCurrency] / rates[fromCurrency]);
    return { success: true, amount: convertedAmount };
}

// VIP System
const vipLevels = {
    silver: { requirement: 100000, benefits: ['reduced fees', 'priority support'] },
    gold: { requirement: 500000, benefits: ['premium cards', 'investment advice'] },
    platinum: { requirement: 1000000, benefits: ['personal banker', 'exclusive events'] }
};

async function checkVipStatus(userId, balance) {
    let level = 'standard';
    for (const [vipLevel, details] of Object.entries(vipLevels)) {
        if (balance >= details.requirement) {
            level = vipLevel;
        }
    }
    return { level, benefits: level === 'standard' ? [] : vipLevels[level].benefits };
}