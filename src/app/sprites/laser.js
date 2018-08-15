import Entity from "./entity";

export default class Laser extends Entity {
    constructor(pos, heading) {
        super()

        this.pos = pos.copy()
        this.vel = p5.createVector(Math.cos(heading), Math.sin(heading))
        this.vel.mult(10)
        this.heading = heading
        this.radius = 2
        this.lifeTime = 1200
        this.startTime = p5.millis()
    }

    expire() {
        return p5.millis() - this.startTime > this.lifeTime
    }

    render() {
        p5.push()

        p5.stroke(255)
        p5.strokeWeight(this.radius)
        p5.point(this.pos.x, this.pos.y)

        p5.pop()
    }
}