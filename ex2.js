/** Example 2
 *
 * The purpose of this example is to show:
 * => The math involved in mapping our 2D screen to a 3D space (aka scene)
 * => How to implicitly model a sphere in the scene with no actual mesh
 * => How to trace rays into the scene and test for an intersection
 *
 * Here is the sequence of steps we need to take:
 * 1) Set up the screen as shown in ex1
 * 2) Set up the state for a scene. We will have only a single sphere in it
 * 3) Set up the perspective (aka camera) to look into the scene
 * 4) We will trace a ray for every pixel of the screen from the camera origin
 * 5) Determine if the ray intersects the sphere.
 * 6) We will color the pixel accordingly
 * 7) We will display the final image to the screen
 * 
 * We will not perform any shading or light modelling, so the scene will look 2d
 *
 */

/* 1) Set up the screen */
let scr = new Screen();


/* 2) Set up the scene state */

// Normally a scene would have many objects contained in an array
// in this case we will just have one sphere to worry about

// First we need to implicitly model a sphere to put in our scene
// We need 2 things to do this, the sphere's center and radius
// We will also add a color for fun
const Sphere = class {
	constructor(center, radius, color) {
		this.center = center;
		this.radius = radius;
		this.color = color;
	}
}

// A sphere at the origin, with a radius of 1
let sph = new Sphere(new Vec3(0.0, 0.0, 0.0), 1.0, new Color(30, 80, 120, 255));
console.log(sph);


/* 3) Set up the perspective */

// Now we need to worry about how we will actually look into this 3d scene
// with our 2d screen. For now we will stay simple and just work with rays

// A ray needs 2 things. An origin, and a direction unit vector
const Ray = class {
	constructor(origin, dir) {
		this.origin = origin;
		this.dir = dir.normalize();
	}
}


/* 4) Trace a ray for every single pixel of the screen */

// This is the core ray tracing algorithm where all the magic happens
// We can begin with set of loops that will iterate over each pixel
for(let y = 0; y < scr.height; y++) {
	for(let x = 0; x < scr.width; x++) {
		/* So now that we have the coordinates of this pixel
		 * We need to create a ray for it
		 * The ray origin should be where the camera is placed
		 * The direction needs to be as follows:
		 * The x coord of the pixel in -1 to 1 space
		 * The y coord of the pixel in -1 to 1 space (invert this since the JS canvas is upside down)
		 * A unit in the negative z direction (into the scene)
		 */
		let r = new Ray( new Vec3(0.0, 0.0, 4.0), // Move the camera back from the origin
				         new Vec3((x / scr.width * 2.0 - 1.0) * 1.2, // Squish the x 20% for looks
					              (y / scr.height * 2.0 - 1.0) * -1.0,
					              -1.0) );

		/** 5) Determine intersection
		 *
		 * Now that we have a ray for the pixel, we need to "trace" it
		 * and see if it intersects the sphere at any point
		 * this math is going to get complicated. I apologize
		 *
		 * First we begin with the implicit equation of our ray
		 * |origin + direction unit * distance| or |o + d*t|
		 *
		 * Nex we need the equation of a sphere
		 * x^2 + y^2 + z^2 = r^2
		 *
		 * Well x,y,z are just the vector for a point, so we can do this
		 * P^2 = r^2 or P^2 - r^2 = 0
		 *
		 * If our ray describes a point on the sphere, that equation will be zero
		 * So that is the test. Lets substitue P for our ray equation.
		 * |o + d*t|^2 - r^2 = 0
		 *
		 * o = ray origin, d = ray unit vector direction, r = sphere radius
		 *
		 * Now we need to see if this equation is solvable by finding t
		 * (o + d*t) * (o + d*t) - r^2 = 0
		 *
		 * Two binomials need to be FOILed
		 * o^2 + odt + odt + d^2t^2 - r^2 = 0
		 *
		 * Simplify in to a quadrafic equation (ax^2 + bx + c)
		 * d^2t^2 + 2odt + o^2-r^2 = 0
		 *
		 * Now we can use the quadratic formula to solve for t where:
		 * a = d^2 or d . d
		 * b = 2*o*d
		 * c = (o . o) - (r * r)
		 *
		 * And since the sphere may not be at the origin, we can account
		 * for that like this (just subtract the origin from the sphere center)
		 * a = d . d
		 * b = 2 * (o - c) . d
		 * c = ((o - c) . (o - c)) - (r * r)
		 *
		 * Now since we are going to solve the quadratic equation, we need to
		 * look at the discriminant (b^2 - 4ac)
		 *
		 * When it is negative, there is no intersection.
		 * When it is zero, the ray is tangent to the sphere (1 intersection)
		 * When it is positive, there are two intersections (1 for each solution)
		 *
		 * IF the discriminant is positive we will take the value closer to zero
		 */
		const oc = r.origin.sub(sph.center);
		const a = r.dir.dot(r.dir);
		const b = 2.0 * oc.dot(r.dir);
		const c = oc.dot(oc) - sph.radius * sph.radius;
		const disc = b*b - 4.0*a*c;
		let t = -1.0; // What we are solving for

		if(x === 0 && y === 0) {
			console.log(oc);
			console.log(a);
			console.log(b);
			console.log(c);
			console.log(disc);
		}

		// No hit
		if(disc < 0.0) { 
			t = - 1.0;
		}
		// 1 hit
		else if(disc === 0.0) {
			t = -0.5 * b / a;
		}
		// 2 hits
		else {
			const t1 = (-0.5 * (b + Math.sqrt(disc))) / a; // hit1
			const t2 = (-0.5 * (b - Math.sqrt(disc))) / a; // hit2

			// We want the positive value that is closer to zero
			if(t1 > 0.0 && t1 < t2) t = t1;
			if(t2 > 0.0 && t2 < t1) t = t2;
		}

		/* 6) Color the pixel */
		if(t >= 0.0) {
			scr.img.setPixel(x, y, sph.color);
		}
	}
}

/* 7) Draw the screen */
scr.drawImg();
