import AsteroidsCollection from '../app/collections/AsteroidsCollection';

export default class Generations {
    constructor(population) {
        this.population = population
        this.species = []
        this.generation = 1
        this.highScore = 0
        this.generationHighscore = 0
        this.avgScore = 0
        this.avgScoreDiff = 0
        this.actualSpecimenBeeingTrained = 0
        this.isEvolving = false
    }

    init(Creature) {
        this.species = Array.from({ length: this.population }, () => new Creature())
    }

    pickOne() {
        let index = 0
        let r = Math.random()
        while (r > 0) {
            r -= this.species[index].fitness
            index += 1
        }
        index -= 1

        let selected = this.species[index].clone()
        return selected
    }

    evolve() {
        
        this.isEvolving = true
        // Get and store the high score
        this.generation += 1
        this.generationHighscore = this.species.reduce((max, creature) => creature.score > max ? creature.score : max, 0)
        this.highScore = this.generationHighscore > this.highScore ? this.generationHighscore : this.highScore

        // Calculate Total Score of this Generation
        const totalScore = this.species.reduce((total, creature) => total += creature.score, 0)

        // Calculate average score of this Generation
        const avgScore = totalScore / this.population
        this.avgScoreDiff = avgScore - this.avgScore;
        this.avgScore = avgScore;

        // Make score exponentially better
        this.species.forEach(creature => creature.expScore = Math.pow(creature.score, 2))
        const totalScoreExponential = this.species.reduce((total, creature) => total += creature.expScore, 0)

        // Assign Fitness to each creature
        this.species.forEach((creature) => creature.fitness = creature.expScore / totalScoreExponential)

        // Preserve best Specimen
        const bestSpecimenBy = this.species.reduce((prev, current) => current.score > prev.score ? current : prev)
        // Check if the actual best is better 
        if (!this.bestSpecimenBy || this.bestSpecimenBy.score < bestSpecimenBy.score) {
            // Or else dispose actual and replace it
            this.bestSpecimenBy && this.bestSpecimenBy.brain.dispose()
            this.bestSpecimenBy = bestSpecimenBy.clone()
        }

        // Create a new generation
        const new_species = this.species.map(() => {
            const parentA = this.pickOne()
            const parentB = this.pickOne()
            const child = parentA.crossover(parentB)
            child.mutate()
            parentA.brain.dispose()
            parentB.brain.dispose()
            return child
        })

        this.species.forEach(s => s.brain.dispose())

        this.species = new_species
        window.totalAsteroids = 5
        this.actualSpecimenBeeingTrained = 0
        window.asteroidsCollection = new AsteroidsCollection(totalAsteroids)
        this.isEvolving = false
        
        // end the evolving
        return
    }

    getActualSpecimen() {
        return this.species[this.actualSpecimenBeeingTrained]
    }

    goToNextSpecimen() {
        // go to next specimen so respawn new asteroids
        if (this.actualSpecimenBeeingTrained < this.species.length - 1) {
            window.totalAsteroids = 5
            window.asteroidsCollection = new AsteroidsCollection(totalAsteroids)
            this.actualSpecimenBeeingTrained++
        } else {
            // If this training reaches the end of the specimen start the evolving
            this.evolve()
        }
    }

    getBetterSpecimen() {
        return this.bestSpecimenBy
    }
}