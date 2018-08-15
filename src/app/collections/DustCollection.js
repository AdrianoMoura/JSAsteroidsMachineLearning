import Dust from "../sprites/dust";

export default class DustCollection {
    constructor() {
        this.dusts = []
    }

    draw() {
        for (let i = 0; i < this.dusts.length; i++) {
            this.dusts[i].draw()
            this.dusts[i].opacity <= 0 && this.dusts.splice(i,1)
        }
    }

    addDust(pos, qtd) {
        for (let i = 0; i < qtd; i++) {
            this.dusts.push(new Dust(pos.copy()))
        }
    }
}