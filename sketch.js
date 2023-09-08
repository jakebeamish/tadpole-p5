let tadpoles = [];


let colours;
let target;

function setup() {
    // colours = [0, 255, 100, color('teal'), color('bisque')];
    colours = [0, 255];
    createCanvas(windowWidth, windowHeight);
    canvas.getContext('2d', { willReadFrequently: true });

    // colours.sort(() => Math.random() - 0.5)

    for (let i = 0; i < 100; i++) {
        let tadpole = new Tadpole(random(width), random(height));
        tadpole.velocity = p5.Vector.random2D();
        tadpoles.push(tadpole);
    }
    background(colours[0]);

    target = createVector(random(width), random(height));
}


function draw() {
    if (frameCount % 1000 == 0) {
        colours.sort(() => Math.random() - 0.5);
        target = createVector(random(width), random(height));
    }
    background(colours[0], 10);
    const mouse = createVector(mouseX, mouseY);

    for (let tadpole of tadpoles) {
        // tadpole.applyForce(tadpole.seek(mouse));
        // tadpole.applyForce(tadpole.seek(createVector()));
        // if (tadpole.seed > 0.5) tadpole.applyForce(tadpole.seek(mouse));
        // const current = createVector(1, 0);
        // current.limit(tadpole.maxforce);
        // tadpole.applyForce(current);

        // tadpole.applyForce(tadpole.seek(target));

        tadpole.flock(tadpoles);
        tadpole.update();
        tadpole.wrapEdges();
        tadpole.show();
    }

    background(colours[0], 50)

    // let amount = 200;
    // loadPixels();
    // const d = pixelDensity();
    // const pixelsCount = 4 * (width * d) * (height * d);
    // for (let i = 0; i < pixelsCount; i += 130) {
    //     const grainAmount = random(-amount, amount);
    //     pixels[i] = pixels[i] + grainAmount;
    //     pixels[i+1] = pixels[i+1] + grainAmount;
    //     pixels[i+2] = pixels[i+2] + grainAmount;
    //     // comment in, if you want to granulate the alpha value
    //     // pixels[i+3] = pixels[i+3] + grainAmount;
    // }
    // updatePixels();


}



class Tadpole {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);

        this.size = random(3, 10);

        // this.size = 7;

        this.speed = (1 / this.size) * 2;
        this.maxspeed = random(2.5, 3);
        // this.maxspeed = 3;
        this.maxforce = 1;
        this.seed = random(0.2, 1);
    }

    update() {
        this.velocity.setMag(this.maxspeed);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);

    }

    flock(others) {
        this.acceleration.mult(0);
        let alignment = this.align(others);
        let cohesion = this.cohesion(others);
        let seperation = this.seperation(others);

        alignment.mult(0.3);
        cohesion.mult(0.1);
        seperation.mult(1);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(seperation);

    }

    align(others) {
        let perception = 100;
        let steering = createVector();
        let total = 0;
        for (let other of others) {
            if (
                this.position.dist(other.position) < perception &&
                this != other
            ) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.velocity);
            steering.setMag(this.maxspeed);
            steering.limit(this.maxforce);
        }

        return steering;
    }

    cohesion(others) {
        let perception = 300;
        let steering = createVector();
        let total = 0;
        for (let other of others) {
            if (
                this.position.dist(other.position) < perception &&
                this != other
            ) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxspeed);
            steering.sub(this.velocity);
            steering.limit(this.maxforce);
        }

        return steering;
    }

    seperation(others) {
        let perception = 30;
        let steering = createVector();
        let total = 0;
        for (let other of others) {
            let d = this.position.dist(other.position);
            if (
                d < perception &&
                this != other
            ) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.div(d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.velocity);
            steering.setMag(this.maxspeed);
            steering.limit(this.maxforce);
        }

        return steering;
    }

    applyForce(force) {
        // We could add mass here if we want A = F / M
        this.acceleration.add(force);
    }

    seek(target) {

        const desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target

        // Scale to maximum speed
        desired.setMag(this.maxspeed);

        // Steering = Desired minus velocity
        const steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce); // Limit to maximum steering force

        return steer;
        //this.applyForce(steer);
    }


    wrapEdges() {
        this.position.x = (this.position.x + width) % width;
        this.position.y = (this.position.y + height) % height;
    }

    show() {
        push();

        let angle = this.velocity.heading() + PI / 2;
        this.speed = map(this.velocity.mag(), -width, width, 0, 1) * (1 / this.size) * 5;
        translate(this.position.x, this.position.y);
        rotate(angle);
        fill(colours[1]);
        stroke(colours[1]);
        circle(0, 0, this.size);
        beginShape();
        vertex(-this.size / 2, 0);
        vertex((-this.size / 2) + map(sin((frameCount * this.speed + this.seed) % TAU), -1, 1, 0, 1) * this.size / 6, this.size / 2);
        vertex(-1 * sin((frameCount * this.speed + this.seed) % TAU) * this.size / 3, this.size * 3);
        vertex((this.size / 2) + map(sin((frameCount * this.speed + this.seed) % TAU), -1, 1, -1, 0) * this.size / 6, this.size / 2);
        vertex(this.size / 2, 0);
        endShape();

        // eyes
        fill(colours[0]);
        stroke(colours[0]);
        circle(-this.size / 4, -this.size / 4, 1);
        circle(+this.size / 4, -this.size / 4, 1);

        // // arms
        // stroke(colours[1]);
        // line(-this.size / 4, -this.size / 4, -this.size * 0.7, -this.size * 0.7);
        // line(this.size / 4, -this.size / 4, this.size * 0.7, -this.size * 0.7);


        pop();
    }
}