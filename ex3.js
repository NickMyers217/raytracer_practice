/** Example 2
 *
 * The purpose of this example is to show:
 * => How to implicitly model a sphere in the scene with no actual mesh
 * => How to trace rays into the scene and test for an intersection
 *
 * We will not perform any shading or light modelling, so the scene will look 2d
 *
 */


// A 3d vector utility class
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
}


// Run this function after the page loads
window.onload = () => {
  // The width and height of  the canvas
  const WIDTH = 640;
  const HEIGHT = 480;
  // Create the canvas element
  let canvas = document.createElement('canvas');
  // Create the drawing context
  let ctx = canvas.getContext('2d');
  // Create and empty byte buffer to store our image
  let img = ctx.createImageData(WIDTH, HEIGHT);

  // Loop through each pixel in the raster space
  for(let y = 0; y < HEIGHT; y++) {
    for(let x = 0; x < WIDTH ; x++) {
      // Set up the screen space coordinates (see ex 2)
      const aspect = WIDTH / HEIGHT;
      const fov = 90;
      const scale = Math.tan(fov * 0.5 * Math.PI / 180);
      pX = ((x + 0.5) / WIDTH * 2.0 - 1.0) * aspect * scale;
      pY = (1 - (y + 0.5) / HEIGHT * 2.0) * scale;

      // Set up the ray origin and direction
      const cameraOrigin = new Vec3(0.0, 0.0, 1.0);
      const ray = {
        o: cameraOrigin,
        dir: new Vec3(pX, pY, -1.0).sub(cameraOrigin).normalize()
      };

      // Set up a sphere
      const sph = {
        center: new Vec3(0.25,1,-2),
        radius: 0.25,
        color: new Vec3(220, 180, 70)
      };

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
       * Simplify in to a quadratic equation (ax^2 + bx + c)
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
      const oc = ray.o.sub(sph.center);
      const a = ray.dir.dot(ray.dir);
      const b = 2.0 * oc.dot(ray.dir);
      const c = oc.dot(oc) - sph.radius * sph.radius;
      const disc = b*b - 4.0*a*c;
      let t = -1.0; // What we are solving for

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
        img.data[y * 4 * WIDTH + x * 4 + 0] = sph.color.x;
        img.data[y * 4 * WIDTH + x * 4 + 1] = sph.color.y;
        img.data[y * 4 * WIDTH + x * 4 + 2] = sph.color.z;
        img.data[y * 4 * WIDTH + x * 4 + 3] = 255;
      } else {
        img.data[y * 4 * WIDTH + x * 4 + 0] = 75;
        img.data[y * 4 * WIDTH + x * 4 + 1] = 75;
        img.data[y * 4 * WIDTH + x * 4 + 2] = 130;
        img.data[y * 4 * WIDTH + x * 4 + 3] = 255;
      }
    }
  }

  // Set the canvas width and height
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  // Add the canvas to the page
  document.body.appendChild(canvas);
  // Put the byte buffer for our image onto the context
  ctx.putImageData(img, 0, 0);
}
