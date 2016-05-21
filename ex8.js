/** Example 8
 *  
 *  The purpose of this example is to add Lambertian lighting to the scene
 *
 *  This will show how a ray tracer can handle a more complex shading solution
 *
 *  We will accomplish this by adding lights to our scene. And then we will
 *  implement Lambert's cosine law to create a simple Lambertian lighting solution.
 *
 */

// Utility 3d vector class
const Vec3 = class {
    constructor(x=0.0, y=0.0, z=0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add({ x,y,z }) {
        return new Vec3(this.x + x, this.y + y, this.z + z);
    }
    sub({ x,y,z }) {
        return new Vec3(this.x - x, this.y - y, this.z - z);
    }
    mult({ x,y,z }) {
        return new Vec3(this.x * x, this.y * y, this.z * z);
    }
    scale(s) {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }
    dot({ x,y,z }) {
        return this.x * x + this.y * y + this.z * z;
    }
    mag() {
        return Math.sqrt(this.dot(this));
    }
    normalize() {
        const m = this.mag();
        return new Vec3(this.x / m, this.y / m, this.z / m);
    }
};


// Utility point light class
const PointLight = class {
    constructor(pos, color, intensity) {
        this.pos = pos; // The light's position
        this.color = color; // The color
        this.i = intensity; // The intesnity of the light
    }
}


// Utility sphere class
const Sphere = class {
    constructor(center, radius, color) {
        this.c = center;
        this.r = radius;
        this.color = color;
    }

    // Test a single sphere for a hit
    intersect(ray) {
        // See ex 3 for the details on this algorithm
        const oc = ray.o.sub(this.c);
        const a = ray.d.dot(ray.d);
        const b = 2.0 * oc.dot(ray.d);
        const c = oc.dot(oc) - this.r * this.r;
        const d = b*b - 4.0*a*c;

        if(d < 0.0) {
            return { wasHit: false, t: Infinity };
        } else if(d === 0.0) {
            return { wasHit: true, t: -0.5 * b / a };
        } else {
            const t0 = (-0.5 * (b + Math.sqrt(d))) / a;
            const t1 = (-0.5 * (b - Math.sqrt(d))) / a;
            let tCloser = t0;

            if(t1 < t0) tCloser = t1;

            return { wasHit: true, t: tCloser };
        }
    }

    // Get the surface normal for a point P on the sphere
    getNormal(p) {
        return p.sub(this.c).normalize();
    }
};


// Utility plane class
const Plane = class {
    constructor(center, normal, color) {
        this.c = center;
        this.n = normal;
        this.color = color;
    }

    // Test the ray for a hit
    // TODO: Unit test this for mathematical accuracy
    intersect(ray) {
        const denom = ray.d.dot(this.n);

        if(denom > 0.000001 || denom < -0.000001) {
            const t = this.c.sub(ray.o).dot(this.n) / denom;

            if(t >= 0.0) return { wasHit: true, t: t };
        }

        return { wasHit: false, t: Infinity };
    }

    // Get the surface normal for a point P on the plane
    getNormal(p) {
        return this.n;
    }
}


// Trace the ray and see if it intersected an object
const trace = function(ray, objs, lights) {
    let hit = false; // We haven't hit yet
    let tMin = Infinity; // This will be the smallest distance we found
    let pColor = new Vec3(60, 40, 190); // The final color of the pixel

    // For each object in the scene
    for(let o = 0; o < objs.length; o++) {
        // Test the individual object for a hit
        const { wasHit, t } = objs[o].intersect(ray);
        
        // If the distance of this hit is less than anything so far
        if(t < tMin) {
            hit = true; // Then we hit
            tMin = t; // The new smallest distance is set

            const hitPoint = ray.o.add(ray.d).scale(t); // Compute the hitpoint of the ray
            const normal = objs[o].getNormal(hitPoint); // Compute the surface normal
            const lightDir = lights[0].pos.sub(hitPoint); // Compute the direction to the light

            // Here we compute the final color
            // The 0.18 is the albedo, or how much light a surface reflects
            // This is generally 18% in most objects
            const hitColor = lights[0].color // Take the initial light color
                .scale(0.18 / Math.PI * lights[0].i) // Scale by the albedo
                // Scale by a clamped dot product of the normal and light direction;
                .scale(Math.max(0.0, normal.dot(lightDir)))
                .mult(objs[o].color); // Finally add in the object color


            pColor = hitColor;
        }
    }

    // Return everything
    return { wasHit: hit, t: tMin, pColor: pColor };
};



// Render our scene into the byte buffer of an image
const render = function(img, objs, lights) {
    const width = img.width; // The width
    const height = img.height; // The height
    const aspect = width / height; // The aspect ration
    const fov = 90; // The fov
    const scale = Math.tan(fov * 0.5 * Math.PI / 180); // The scale

    // For every pixel in the image
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            // The correct screen space coordinates of the pixel
            const i = ((x + 0.5) / width * 2.0 - 1.0) * aspect * scale;
            const j = (1 - (y + 0.5) / height * 2.0) * scale;

            // The camera origin vector
            const camera = new Vec3(0.0, 0.0, 1.0);
            
            // The ray with an origin and direction
            const ray = {
                o: camera,
                d: new Vec3(i, j, -1.0).sub(camera).normalize()
            };

            // Trace the ray, and return the following:
            // wasHit: boolean value stating if the ray hit
            // t: the distance to the hit
            // pColor: the color of the pixel
            const { wasHit, t, pColor } = trace(ray, objs, lights);

            // Color the pixel in the byte buffer
            let b = y * 4 * width + x * 4;
            img.data[b + 0] = pColor.x;
            img.data[b + 1] = pColor.y;
            img.data[b + 2] = pColor.z;
            img.data[b + 3] = 255;
        }
    }

    // Return the image
    return img;
}


// Generate a list of n random spheres
const generateSpheres = function(n) {
    // A list of spheres
    let sphs = [];

    // For each sphere
    for(let s = 0; s < n; s++) {
        const x = Math.random() * 2.0 - 1.0; // A x between -1 and 1
        const y = Math.random() * 2.0 - 1.0; // A y between -1 and 1
        const z = (Math.floor(Math.random() * 9) + 1) * -1; // z between -1 and -9
        const c = new Vec3(x,y,z); // The center
        const rad = Math.random(); // A random radius between 0 and 1
        const r = Math.floor(Math.random() * 255); // Red between 0 and 255
        const g = Math.floor(Math.random() * 255); // Green between 0 and 255
        const b = Math.floor(Math.random() * 255); // Blue between 0 and 255
        const color = new Vec3(r,g,b); // The final color
        const sph = new Sphere(c, rad, color); // Make the sphere

        sphs.push(sph); // Add the sphere
    }

    // Return the list
    return sphs;
};


window.onload = () => {
    // Decide the image resolution
    const width = 1080;
    const height = 720;

    // Prepare the data for our scene
    // A list of objects to render (each needs to have an intersect method and color)
    let objects = generateSpheres(12);
    // Add a plane to the list
    objects.push(new Plane(new Vec3(0, -1, 0), new Vec3(0,1,0), new Vec3(20,20,20)));

    // We also need all the lights in the scene
    // Position one light to left of the spheres
    let lights = [new PointLight(new Vec3(-2,2,1), new Vec3(1,1,1), 20)];

    // Print scen info for debugging
    console.log(objects);
    console.log(lights);

    // Create the canvas, context, and empty image
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let img = ctx.createImageData(width, height);

    // Render the scene to an image
    img = render(img, objects, lights);

    // Test that all the colors are a correct value
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            const b = y * 4 * width + x * 4;
            const px = img.data[b + 0];
            const py = img.data[b + 1];
            const pz = img.data[b + 2];
            const pa = img.data[b + 3];

            if(px < 0 || px > 255) {
                console.log('Px (' + px + ') is discrepant at ' + x + ', ' + y + '!');
            }
            if(py < 0 || py > 255) {
                console.log('Py (' + py + ') is discrepant at ' + x + ', ' + y + '!');
            }
            if(pz < 0 || pz > 255) {
                console.log('Pz (' + pz + ') is discrepant at ' + x + ', ' + y + '!');
            }
            if(pa < 0 || pa > 255) {
                console.log('Pa (' + pa + ') is discrepant at ' + x + ', ' + y + '!');
            }
        }
    }

    // Display it
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    ctx.putImageData(img, 0, 0);
};
