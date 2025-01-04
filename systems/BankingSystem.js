import { EventEmitter } from 'events';
import { bankingConfig } from '../config/banking.js';
import { DatabaseError } from '../db/errors/DatabaseError.js';
import { Logger } from '../utils/logger.js';

export class BankingSystem extends EventEmitter {
    constructor(dbManager) {
        super();
        this.dbManager = dbManager;
        this.logger = new Logger('BankingSystem');
        
        // Start periodic tasks
        setInterval(() => this.processInterest(), 3600000); // Every hour
        setInterval(() => this.processLoans(), 86400000);   // Every day
    }

    async openAccount(userId, accountType = 'savings') {
        const config = bankingConfig.accounts[accountType];
        if (!config) throw new Error('Invalid account type');

        return await this.dbManager.transaction(async () => {
            const account = await this.dbManager.createBankAccount(userId, {
                type: accountType,
                balance: 0,
                interestRate: config.interestRate,
                minBalance: config.minBalance,
                maxBalance: config.maxBalance,
                withdrawalLimit: config.withdrawalLimit
            });

            this.emit('accountOpened', { userId, accountType });
            return account;
        });
    }

    async applyForLoan(userId, amount, termMonths) {
        const creditScore = await this.dbManager.getUserCreditScore(userId);
        const config = bankingConfig.loans.personal;

        if (amount < config.minAmount || amount > config.maxAmount) {
            throw new Error('Invalid loan amount');
        }

        if (creditScore < config.requirements.creditScore) {
            throw new Error('Credit score too low');
        }

        const interestRate = this.calculateInterestRate(creditScore);
        const monthlyPayment = this.calculateMonthlyPayment(amount, interestRate, termMonths);

        const loan = await this.dbManager.createLoan({
            userId,
            amount,
            interestRate,
            termMonths,
            monthlyPayment,
            status: 'active'
        });

        await this.dbManager.addCoins(userId, amount);
        this.emit('loanCreated', { userId, amount, interestRate });
        return loan;
    }

    async processInterest() {
        const accounts = await this.dbManager.getAllSavingsAccounts();
        
        for (const account of accounts) {
            try {
                const interest = Math.floor(account.balance * (account.interestRate / 365));
                if (interest > 0) {
                    await this.dbManager.addToBalance(account.id, interest);
                    this.emit('interestPaid', {
                        userId: account.userId,
                        amount: interest
                    });
                }
            } catch (error) {
                this.logger.error(`Interest processing error for account ${account.id}:`, error);
            }
        }
    }

    calculateInterestRate(creditScore) {
        const baseRate = bankingConfig.loans.personal.baseRate;
        const creditScoreImpact = Math.max(0, (creditScore - 500) / 1000);
        return baseRate - (creditScoreImpact * 0.02);
    }

    calculateMonthlyPayment(principal, annualRate, termMonths) {
        const monthlyRate = annualRate / 12;
        return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
               (Math.pow(1 + monthlyRate, termMonths) - 1);
    }

    async processLoans() {
        const activeLoans = await this.dbManager.getActiveLoans();
        
        for (const loan of activeLoans) {
            try {
                if (loan.nextPaymentDue <= new Date()) {
                    const success = await this.processLoanPayment(loan);
                    if (!success) {
                        await this.handleMissedPayment(loan);
                    }
                }
            } catch (error) {
                this.logger.error(`Loan processing error for loan ${loan.id}:`, error);
            }
        }
    }

    async processLoanPayment(loan) {
        return await this.dbManager.transaction(async () => {
            const user = await this.dbManager.getUser(loan.userId);
            if (user.coins < loan.monthlyPayment) {
                return false;
            }

            await this.dbManager.addCoins(loan.userId, -loan.monthlyPayment);
            await this.dbManager.updateLoan(loan.id, {
                remainingPayments: loan.remainingPayments - 1,
                nextPaymentDue: new Date(Date.now() + 2592000000) // +30 days
            });

            if (loan.remainingPayments <= 1) {
                await this.dbManager.updateLoan(loan.id, { status: 'completed' });
                await this.dbManager.updateCreditScore(loan.userId, 10);
            }

            this.emit('loanPaymentMade', {
                userId: loan.userId,
                amount: loan.monthlyPayment
            });

            return true;
        });
    }

    async handleMissedPayment(loan) {
        await this.dbManager.updateCreditScore(loan.userId, -20);
        await this.dbManager.addLoanPenalty(loan.id);
        
        this.emit('loanPaymentMissed', {
            userId: loan.userId,
            loanId: loan.id
        });
    }

    async handleRaceWinnings(userId, amount) {
        const account = await this.dbManager.getBankAccount(userId, 'savings');
        if (!account) return amount;

        // Auto-deposit percentage of winnings if enabled
        const autoDepositPct = await this.dbManager.getUserSetting(userId, 'autoDepositPct') || 0;
        if (autoDepositPct > 0) {
            const depositAmount = Math.floor(amount * (autoDepositPct / 100));
            await this.deposit(userId, 'savings', depositAmount);
            return amount - depositAmount;
        }

        return amount;
    }

    async applyForCarLoan(userId, carId) {
        const car = await this.dbManager.getCar(carId);
        const creditScore = await this.dbManager.getUserCreditScore(userId);

        // Special car loan validation
        const maxLoanAmount = this.calculateMaxCarLoan(creditScore);
        if (car.price > maxLoanAmount) {
            throw new Error('Car price exceeds maximum loan amount');
        }

        // Create car-specific loan
        return await this.createCarLoan(userId, car);
    }

    async handleSpecialLoan(userId, type, amount, itemId) {
        return await this.dbManager.transaction(async () => {
            switch(type) {
                case 'car':
                    const carListing = await this.marketSystem.getCarListing(itemId);
                    if (!carListing || carListing.price > amount) {
                        throw new Error('Invalid car loan request');
                    }
                    break;
                
                case 'business':
                    // Check career level requirements
                    const careerLevel = await this.careerSystem.getBusinessSkillLevel(userId);
                    if (careerLevel < 5) {
                        throw new Error('Insufficient business experience for loan');
                    }
                    break;
            }

            const loan = await this.createLoan(userId, {
                amount,
                type,
                itemId,
                interestRate: await this.calculateSpecialRate(userId, type)
            });

            return loan;
        });
    }

    async processPayment(userId, amount, type) {
        // Route payment through appropriate system
        switch(type) {
            case 'market':
                await this.marketSystem.processPurchase(userId, amount);
                break;
            case 'career':
                await this.careerSystem.processJobPayment(userId, amount);
                break;
            default:
                await this.dbManager.addCoins(userId, amount);
        }
    }

    async handleJobPayment(userId, amount) {
        return await this.dbManager.transaction(async () => {
            // Get user's savings preferences
            const { autoSavePercent } = await this.dbManager.getUserSettings(userId);
            
            if (autoSavePercent > 0) {
                const saveAmount = Math.floor(amount * (autoSavePercent / 100));
                await this.deposit(userId, 'savings', saveAmount);
                amount -= saveAmount;
            }

            // Add remaining amount to user's balance
            await this.dbManager.addCoins(userId, amount);
            
            return amount;
        });
    }
}
