import Entity from "./entity";

class Dust extends Entity {
    constructor(pos) {
        super()

        this.pos = pos.copy()
        this.vel = p5.createVector(p5.random(-1, 1), p5.random(-1, 1))
        this.opacity = p5.random(.5, 1)
    }

    render() {
        p5.stroke(255 * this.opacity)
        p5.point(this.pos.x, this.pos.y)
        this.opacity-=.01
    }
}

export default Dust