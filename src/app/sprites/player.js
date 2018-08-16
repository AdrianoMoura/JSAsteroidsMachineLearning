import Entity from "./entity"
import Laser from "./laser"
import NeuralNetwork from "../../machineLearning/NeuralNetwork"
import * as tf from '@tensorflow/tfjs';

export default class Player extends Entity {
    constructor() {
        super()

        this.lasers = []
        this.radius = 10
        this.died = false
        this.dieTimeout = 2000
        this.isSafe = true
        this.safeCheck = 0
        this.brain = new NeuralNetwork(31, 100, 4)
        this.fitness = 0
        this.score = 0
        this.lifes = 1
        this.canShoot = true
        this.canWarp = true
    }

    think() {
        tf.tidy(() => {
            // Player won't thinks if is died and respawning 
            if (this.died) {
                return
            }

            // Select the nearest 5 asteroids 
            // Because asteroids splits the number of inputs increases so wasn't possible to feed forward all asteroids info through the input layer
            const nearestAsteroids = asteroidsCollection.asteroids.sort((a, b) => {
                const distA = p5.dist(a.x, a.y, this.pos.x, this.pos.y)
                const distB = p5.dist(b.x, b.y, this.pos.x, this.pos.y)

                if (distA > distB) {
                    return 1
                } else if (distA < distB) {
                    return -1
                }

                return 0
            }).slice(0, 5)

            // get all asteroids info           
            let asteroidsInfo = []

            for (let i = 0; i < 5; i++) {
                if (i < nearestAsteroids.length) {
                    asteroidsInfo.push(nearestAsteroids[i].pos.x)
                    asteroidsInfo.push(nearestAsteroids[i].pos.y)
                    asteroidsInfo.push(nearestAsteroids[i].vel.x)
                    asteroidsInfo.push(nearestAsteroids[i].vel.y)
                    asteroidsInfo.push(nearestAsteroids[i].radius)
                } else {
                    // If asteroids total is less than 5 push empty values to preserve input array shape
                    asteroidsInfo.push(0)
                    asteroidsInfo.push(0)
                    asteroidsInfo.push(0)
                    asteroidsInfo.push(0)
                    asteroidsInfo.push(0)
                }
            }

            // Get players info
            const playerInfo = [this.pos.x, this.pos.y, this.vel.x, this.vel.y, this.heading, this.accel]

            // Make a guess
            const result = this.brain.predict([...asteroidsInfo, ...playerInfo])

            // Get the outputs and make actions
            const rotation = result[0]
            const thrust = result[1]
            const warp = result[2]
            const shoot = result[3]

            // Set rotation left, right ou maintain steady
            if (rotation > 0 && rotation < .33) {
                this.rotate('LEFT')
            } else if (rotation > .66 && rotation < 1) {
                this.rotate('RIGHT')
            } else {
                this.rotate()
            }

            // Accelerate or stop
            if (thrust >= .5) {
                this.thrust(true)
            } else {
                this.thrust(false)
            }

            // Make a warp
            if (warp >= .5) {
                this.warp()
            }

            // Do a laser shoot
            if (shoot >= .5) {
                this.shoot()
            }
        });
    }

    shoot() {
        /* 
        When playing an human use the space keyboard to shoot so it will be an reasonably delay beetween each shoot
        As an IA the player can be shooting constantly that will break the proposite of learning, creating an advantage to the machine
        So I decide to add an delay beetween the shoots to make they look more like a traditional gameplay
        */
        if (this.canShoot) {
            this.canShoot = false
            soundController.laser()
            this.lasers.push(new Laser(this.pos, this.heading))

            setTimeout(() => this.canShoot = true, 200)
        }
    }

    rotate(direction) {
        if (direction === 'LEFT')
            this.rotation = -.08
        else if (direction === 'RIGHT')
            this.rotation = .08
        else
            this.rotation = 0
    }

    thrust(accel = true) {
        this.accel = accel ? .1 : 0
    }

    warp() {
        if (this.canWarp) {
            this.canWarp = false
            this.pos = p5.createVector(p5.random(0, canvasWidth), p5.random(0, canvasHeight))

            setTimeout(() => this.canWarp = true, 200)
        }
    }

    hits(asteroid) {
        const asteroidPos = asteroid.pos.copy()

        const dist = p5.dist(asteroidPos.x, asteroidPos.y, this.pos.x, this.pos.y)

        if (dist < this.radius + asteroid.radius) {
            if (!this.died) {
                this.die()
                asteroid.split()
            }
        }

        // Isn't safe to respawn?
        if (dist < this.radius + asteroid.radius * 2) {
            this.isSafe = false
            clearTimeout(this.safeCheck)
            this.safeCheck = 0
            // Set one seconds respawn delay if the zone is to dangerously, this will prevent to player respawn and die instantly
            this.safeCheck = setTimeout(() => this.isSafe = true, 2000)
        }
    }

    die() {
        this.lifes--

        this.brokenParts = Array.from({ length: 4 }, () => ({
            pos: this.pos.copy(),
            vel: p5.createVector(p5.random(-1, 1), p5.random(-1, 1)),
            heading: 0,
            rotation: p5.random(-0.1, 0.1),
            opacity: p5.random(.8, 1),
        }))

        this.died = true
        this.pos = p5.createVector(canvasWidth / 2, canvasHeight / 2)
        this.vel = p5.createVector(0, 0)
        this.accel = 0
        this.startDie = p5.millis()
    }

    render() {
        if (this.died) {
            this.died = !(p5.millis() - this.startDie > this.dieTimeout && this.isSafe)

            // Draw broken parts
            this.brokenParts.forEach(part => {
                part.pos.add(part.vel)
                part.heading += part.rotation
                p5.push()
                p5.stroke(255 * part.opacity)
                part.opacity -= .01
                p5.translate(part.pos.x, part.pos.y)
                p5.rotate(part.heading)
                p5.line(-this.radius / 2, -this.radius / 2, this.radius / 2, this.radius / 2)
                p5.pop()
            })

            return
        }

        if (this.accel > 0)
            soundController.thrust()

        // Draw ship
        p5.push()
        p5.noFill()
        p5.stroke(255)

        p5.translate(this.pos.x, this.pos.y)
        p5.rotate(this.heading + p5.PI / 2)
        p5.beginShape()

        p5.vertex(0, -this.radius)
        p5.vertex(this.radius, this.radius)
        p5.vertex(0, this.radius / 2)
        p5.vertex(-this.radius, this.radius)

        p5.endShape(p5.CLOSE)

        // Draw fire when accel is greaten than 0
        if (this.accel > 0 && p5.frameCount % 5 > 2) {
            p5.beginShape()

            p5.vertex(this.radius * .4, this.radius * .8)
            p5.vertex(0, this.radius * 1.5)
            p5.vertex(-this.radius * .4, this.radius * .8)

            p5.endShape()
        }

        p5.pop()

        this.lasers.forEach(laser => laser.draw())
    }

    clone() {
        let player = new Player()
        player.score = this.score
        player.brain.dispose()
        player.brain = this.brain.clone()
        return player
    }


    crossover(partner) {
        
        // Get NeuralNetwork layers from parents
        const parentADna = this.brain.layers_weights
        const parentBDna = partner.brain.layers_weights

        // Create a new array of layers to child's NeuralNetwork based on both parents NeuralNetwork DNA, iterating over each NeuralNetwork layer
        const childLayers = Array.from({ length: parentADna.length }, (el, i) => {
            // Get the raw weight values from actual NeuralNetwork layer
            const dnaAWeight = parentADna[i].dataSync()
            const dnaBWeight = parentBDna[i].dataSync()
            const shape = parentADna[i].shape

            // Make a new array of weights crossing over the parent NeuralNetwork DNA
            const childDna = Array.from({ length: dnaAWeight.length }, (p, i) => {
                // Random to decide if we gonna get parentA genome or parentB genome
                if (p5.random() > .5) {
                    return dnaAWeight[i]
                } else {
                    return dnaBWeight[i]
                }
            })

            // Return a new tensor with child generated DNA and same shape
            return tf.tensor(childDna, shape)
        })

        // Create the child
        let child = this.clone()
        // Dispose any existing data
        child.brain.dispose()
        // Override existing layers with new layers generated by crossover
        child.brain.layers_weights = childLayers
        

        return child
    }

    mutate() {
        
        // Iterate over each brain layer to mutate then
        this.brain.layers_weights = this.brain.layers_weights.map(layer => {
            // Run over each value of actual layer
            const mutated_weights = layer.dataSync().map(x => {
                // Use a random to decide the chance of this genome being mutated
                if (p5.random() < 0.05) {
                    // Apply an randomGaussian to existing genome and return it
                    let offset = p5.randomGaussian() * 0.5
                    return x + offset
                }
                // return the same genome won't modified
                return x
            })
            const shape = layer.shape

            // Dispose actual layer
            layer.dispose()
            // Return a new tensor with mutated weights and same shape
            return tf.tensor(mutated_weights, shape)
        })
        
    }
}