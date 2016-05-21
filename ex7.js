/** Example 7
 *  
 *  The purpose of this example is to add some simple shading to our scene
 *
 *  This will finally make the scene look 3d
 *
 *  This will show how a ray tracer can handle a shading solution
 *
 *  We will accomplish this by ensuring our geometries implement a way
 *  to calculate their surface normals at a given point. And then we will
 *  create a simple shading solution.
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
const trace = function(ray, objs) {
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

            // Here is where we shade the objects color
            // We will take the clamped dot product of the surface normal and view direction
            // The view direction is just the opposite of the ray direction
            // This will give us a facing ratio between 0 and 1
            // 0 being not visible, and 1 being totally visible
            // We can apply that ratio to the color to scale it
            const hitPoint = ray.o.add(ray.d).scale(t);
            let ratio = Math.max(0, objs[o].getNormal(hitPoint).dot(ray.d.scale(-1)));
            // For a more exaggerated effect, we can scale the ratio by its sin
            ratio *= Math.sin(ratio);
            // Set the pixel color
            pColor = objs[o].color.scale(ratio);
        }
    }

    // Return everything
    return { wasHit: hit, t: tMin, pColor: pColor };
};



// Render our scene into the byte buffer of an image
const render = function(img, objs) {
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
            const { wasHit, t, pColor } = trace(ray, objs);

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
    objects.push(new Plane(new Vec3(0, -1, 0), new Vec3(0,1,0), new Vec3(255, 255, 255)));
    console.log(objects);

    // Create the canvas, context, and empty image
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let img = ctx.createImageData(width, height);

    // Render the scene to an image
    img = render(img, objects);

    // Display it
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    ctx.putImageData(img, 0, 0);
};
