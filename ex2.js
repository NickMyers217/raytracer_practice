/** Example 2
 *
 * The purpose of this example is to set up our canvas for rendering
 * a 3d scene.
 *
 * This will involve mapping our 2d grid of pixels, or raster coordinate space,
 * to the screen coordinate space in which all of our eventual 3d objects
 * will reside. Then we will create a ray for each pixel and assign a color to it.
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
      // Fhe first step in remapping the raster space is to 
      // convert to NDC (normalized device coordinates).
      // NDC puts x and y between 0 and 1.
      // The + 0.5 is so that x and y represent the CENTER of the pixel.
      let ndcX = (x + 0.5) / WIDTH;
      let ndcY = (y + 0.5) / HEIGHT;

      // Now converting ndc to screen space is trivial.
      // It just needs to be from -1 to 1 instead of 0 to 1.
      let pX = ndcX * 2.0 - 1.0;
      // The y coordinate is upside down, so we invert it.
      let pY = 1.0 - ndcY * 2.0;

      // Unfortunately that assumes a square image.
      // Often times an image is wider than it is taller due to its
      // aspect ratio (width / height). If that is the case
      // we need to correct our x coordiante accordingly.
      pX *= (WIDTH / HEIGHT);

      // There is one more thing that can be done now.
      // This whole thing assumes a field of view of 90 degrees.
      // We can scale our coordinates for a different FOV like this.
      const fov = 90;
      pX *= Math.tan(fov * 0.5 * Math.PI / 180);
      pY *= Math.tan(fov * 0.5 * Math.PI / 180);

      // That seemed like a lot of work, but it can be summed up concisely
      const aspect = WIDTH / HEIGHT;
      const scale = Math.tan(fov * 0.5 * Math.PI / 180);
      pX = ((x + 0.5) / WIDTH * 2.0 - 1.0) * aspect * scale;
      pY = (1 - (y + 0.5) / HEIGHT * 2.0) * scale;

      // pX and pY now represent the x and y coordinate of the pixel center
      // in screen space. We need to represent a ray moving from the 
      // origin of our eyeball or camera to this pixel center on the screen
      // Lets create a vector representing our camera
      const O = new Vec3(0.0, 0.0, 1.0); // We moved it back from the origin on the z axis
      // Lets create the vector for the ray's direction
      // It is simply, the point of our pixel looking in the z direction
      // minus the camera's origin vector, then normalized.
      const R = new Vec3(pX, pY, -1.0).sub(O).normalize();

      // At this point, we have a ray traveling from the camera into the scene
      // through the center of the pixel at x, y.
      // But what if we wanted to move the camera to a different place in the scene
      // or world?
      // For that we could adjust the ray with a matrix transformation, specifically
      // the camera-to-world matrix.
      // I will elect not to do that at this point in time.
      // Keeping the camera where it is, we would now trace the ray into the scene
      // by testing it against all of our objects for intersections.
      // An intersection with an object would change the pixels eventual color.
      // Since we do not yet have any objects, i will just arbitrarily assign
      // the pixel color based on the values of pX and Py to make sure everything
      // is working.
      // The result should be a nice interpolated gradient
      const color = new Vec3(1.0, 1.0, 1.0).add(R).scale(0.5);

      img.data[y * 4 * WIDTH + x * 4 + 0] = Math.min(Math.max(color.x, 0), 1) * 255;
      img.data[y * 4 * WIDTH + x * 4 + 1] = Math.min(Math.max(color.y, 0), 1) * 255;
      img.data[y * 4 * WIDTH + x * 4 + 2] = Math.min(Math.max(color.z, 0), 1) * 255;
      img.data[y * 4 * WIDTH + x * 4 + 3] = 255;
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