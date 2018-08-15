import AsteroidsCollection from '../app/collections/AsteroidsCollection';

export default class Generations {
    constructor(population) {
        this.population = population
        this.species = []
        this.generation = 1
        this.highScore = 0
        this.avgScore = 0
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
        console.log('start evolving')
        this.isEvolving = true
        // Get and store the high score
        this.generation += 1
        let generationHighscore = this.species.reduce((totalScore, creature) => creature.score > totalScore ? creature.score : totalScore, 0)
        this.highScore = generationHighscore > this.highScore ? generationHighscore : this.highScore

        // Calculate Total Score of this Generation
        const totalScore = this.species.reduce((totalScore, creature) => totalScore += creature.score, 0)

        // Calculate average score of this Generation
        this.avgScore = totalScore / this.population;

        // Assign Fitness to each creature
        this.species.forEach((creature) => creature.fitness = creature.score / totalScore)

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
        console.log('ending evolving')
        // end the evolving
        return
    }

    getActualSpecimen() {
        return this.species[this.actualSpecimenBeeingTrained]
    }

    goToNextSpecimen() {
        // go to next specimen so respawn new asteroids
        if (this.actualSpecimenBeeingTrained < this.species.length - 1) {
            window.asteroidsCollection = new AsteroidsCollection(totalAsteroids)
            this.actualSpecimenBeeingTrained++
        } else {
            // If this training reaches the end of the specimen start the evolving
            this.evolve()
        }
    }
}