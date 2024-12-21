export default class Entity {
    constructor() {
        this.heading = -p5.PI/2
        this.rotation = 0
        this.pos = p5.createVector(canvasWidth/2, canvasHeight/2)
        this.vel = p5.createVector(0,0)
        this.accel = 0
    }

    move() {
        this.heading += this.rotation;
        let force = p5.createVector(Math.cos(this.heading), Math.sin(this.heading))

        force.mult(this.accel);
        this.vel.add(force);

        this.pos.add(this.vel);

        if (this.pos.x > canvasWidth + this.radius) {
            this.pos.x = 0 - this.radius
        } else if (this.pos.x < 0 - this.radius) {
            this.pos.x = canvasWidth + this.radius
        } 
        
        if (this.pos.y > canvasHeight + this.radius) {
            this.pos.y = 0 - this.radius
        } else if (this.pos.y < 0 - this.radius) {
            this.pos.y = canvasHeight + this.radius
        } 
    }

    setRotation(rotation) {
        this.rotation = rotation
    }
}