import { EventEmitter } from 'events';
import { PhysicsEngine } from './PhysicsEngine.js';

export class RaceSystem extends EventEmitter {
    constructor(dbManager) {
        super();
        this.dbManager = dbManager;
        this.activeRaces = new Map();
        this.physicsEngine = new PhysicsEngine();

        // Add experience tracking
        this.experienceMultiplier = 1.0;
        this.careerSystem = null;
    }

    setCareerSystem(careerSystem) {
        this.careerSystem = careerSystem;
    }

    async startRace(raceId, participants) {
        // ...existing code...
        // Add physics calculations
        const raceState = {
            startTime: Date.now(),
            participants: participants.map(p => ({
                userId: p.userId,
                car: p.car,
                position: 0,
                velocity: 0,
                acceleration: this.physicsEngine.calculateAcceleration(p.car)
            }))
        };

        this.activeRaces.set(raceId, raceState);
        // ...existing code...
    }

    updateRacePositions(raceId) {
        const race = this.activeRaces.get(raceId);
        if (!race) return;

        race.participants.forEach(p => {
            // Apply physics calculations
            const forces = this.physicsEngine.calculateForces(p);
            p.acceleration = forces.acceleration;
            p.velocity += p.acceleration * this.physicsEngine.deltaTime;
            p.position += p.velocity * this.physicsEngine.deltaTime;
        });
    }

    async processRaceRewards(raceId) {
        const race = this.activeRaces.get(raceId);
        if (!race) return;

        // Sort by position
        race.participants.sort((a, b) => b.position - a.position);

        // Calculate rewards with experience
        for (let i = 0; i < race.participants.length; i++) {
            const participant = race.participants[i];
            const position = i + 1;
            
            const rewards = this.calculateRewards(position, race.type);
            
            // Update user stats
            await this.dbManager.transaction(async () => {
                await this.dbManager.addCoins(participant.userId, rewards.coins);
                await this.dbManager.addExperience(participant.userId, rewards.experience);
                
                // Update car stats
                await this.dbManager.updateCarStats(participant.car.id, {
                    races: { $inc: 1 },
                    wins: { $inc: position === 1 ? 1 : 0 }
                });

                // Notify career system if exists
                if (this.careerSystem && position === 1) {
                    await this.careerSystem.handleRaceWin(participant.userId, race.type);
                }
            });

            this.emit('raceReward', {
                userId: participant.userId,
                position,
                rewards
            });
        }
    }

    async finishRace(raceId) {
        const race = this.activeRaces.get(raceId);
        if (!race) return;

        // Sort racers by position
        const sortedRacers = [...race.participants]
            .sort((a, b) => b.position - a.position);

        // Process rewards and career progression
        await Promise.all(sortedRacers.map(async (racer, index) => {
            const position = index + 1;
            const rewards = await this.calculateRaceRewards(racer, position);
            
            // Update banking & career together
            await this.dbManager.transaction(async () => {
                // Process winnings through banking system
                const finalCoins = await this.bankingSystem.handleRaceWinnings(
                    racer.userId, 
                    rewards.coins
                );

                await this.careerSystem.handleRaceComplete(
                    racer.userId,
                    race.type,
                    position,
                    rewards.experience
                );

                await this.dbManager.updateUserStats(racer.userId, {
                    coins: finalCoins,
                    experience: rewards.experience,
                    racesCompleted: { $inc: 1 },
                    wins: { $inc: position === 1 ? 1 : 0 }
                });
            });
        }));

        this.emit('raceComplete', { raceId, results: sortedRacers });
    }
}
