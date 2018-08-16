import * as tf from '@tensorflow/tfjs';

import AsteroidsCollection from './collections/AsteroidsCollection';
import GameController from './gameController';
import Player from './sprites/player';
import DustCollection from './collections/DustCollection';
import SoundController from './soundController';
import Generations from '../machineLearning/Generations';

const sketch = (p5) => {
    window.p5 = p5
    window.canvasWidth = 1080
    window.canvasHeight = 720
    window.totalAsteroids = 5

    p5.preload = () => {
        window.font = p5.loadFont('Hyperspace.otf')
        window.soundController = new SoundController()
    }

    // Setup function
    // ======================================
    p5.setup = () => {
        p5.createCanvas(canvasWidth, canvasHeight)
        p5.textFont(font)
        
        // Prepare game
        window.gameController = new GameController()
        window.dustCollection = new DustCollection()

        // Create a generation
        window.generation = new Generations(10)
        
        // Starts a generation
        generation.init(Player)

        // Create first asteroids collection
        window.asteroidsCollection = new AsteroidsCollection(totalAsteroids)
    }

    // Draw function
    // ======================================
    p5.draw = () => {
        p5.background(0)

        if (generation.isEvolving) 
            return

        // get actual player to test
        const player = generation.getActualSpecimen()

        // Draw game elements
        asteroidsCollection.draw()
        dustCollection.draw()
        player.think()
        player.draw()

        // Show actual score
        p5.textSize(28);
        p5.fill(255);
        p5.textAlign(p5.LEFT);
        p5.text(player.score, 100, 100);

        // Show high score
        p5.textAlign(p5.CENTER);
        p5.text(generation.highScore, canvasWidth / 2, 100);

        // Show remaining lifes
        for (let i = 0; i < generation.getActualSpecimen().lifes; i++) {
            p5.push()
            p5.noFill()
            p5.stroke(255)

            p5.translate(25 * i + 108, 130)
            p5.beginShape()

            p5.vertex(0, -10)
            p5.vertex(10, 10)
            p5.vertex(0, 10 / 2)
            p5.vertex(-10, 10)

            p5.endShape(p5.CLOSE)
            p5.pop()
        }

        // Go to next level
        if (asteroidsCollection.asteroids.length === 0) {
            gameController.nextLevel()
            return
        }

        // Iterate over each asteroid to check if a laser hits it or a player hits it 
        asteroidsCollection.asteroids.forEach(asteroid => {

            // Check if the player hits actual asteroid
            player.hits(asteroid)

            // Check if laser hit the actual asteroid
            player.lasers.every((laser, index) => {
                if (asteroid.hits(laser)) {
                    player.lasers.splice(index, 1)
                    return false
                }

                laser.expire() && player.lasers.splice(index, 1)
                return true
            })
        })

        if (player.lifes === 0) {
            // When loses all lifes let a new player try
            generation.goToNextSpecimen()
        }


        // Show estatistics 
        p5.textSize(16);
        p5.textAlign(p5.LEFT);
        p5.text(
            `
            Generation:_____ ${generation.generation}
            Specimen:_______ ${generation.actualSpecimenBeeingTrained+1}/${generation.population}
            HighScore:______ ${generation.highScore}
            Asteroids:______ ${asteroidsCollection.asteroids.length}\n
            Last Generation:
            HighScore:______ ${generation.generationHighscore}
            Avg. Score:_____ ${generation.avgScore} ${generation.avgScoreDiff ? `${(generation.avgScoreDiff<0?"":"+")}${generation.avgScoreDiff}` : ''}
            N. Tensors:_____ ${tf.memory().numTensors}
            `
            , canvasWidth/2+100, canvasHeight/2+100);
    }
}

export default sketch