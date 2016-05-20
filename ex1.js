/** Example 1
 *
 * The only purpose of this example is to create a canvas and render a random
 * buffer of pixels to it. This demonstrates the extremely lightweight api
 * for rendering pixels, which will be used throughout these examples.
 *
 */

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

  // Loop through the byte buffer 4 bytes at a time
  // noprotect
  for(let p = 0; p < img.data.length; p += 4) {
    // Set the r, g, b, a components of this pixel
    // The r,g,b are a random int between 0 and 255
    // The a is 255 for no transparency
    img.data[p + 0] = Math.floor(Math.random() * 255);
    img.data[p + 1] = Math.floor(Math.random() * 255);
    img.data[p + 2] = Math.floor(Math.random() * 255);
    img.data[p + 3] = 255;
  }

  // Set the canvas width and height
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  // Add the canvas to the page
  document.body.appendChild(canvas);
  // Put the byte buffer for our image onto the context
  ctx.putImageData(img, 0, 0);
}
