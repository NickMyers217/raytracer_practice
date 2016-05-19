/** Example 1
 *
 * The only purpose of this example is to create a canvas and render a random
 * buffer of pixels to it. This demonstrates the extemely lightweight api
 * for rendering pixels that has been created for these examples.
 *
 */

// Create a new screen
let scr = new Screen(640, 480);

// Randomize all of the pixels in the screen's image
scr.img.setRandom();

// Render the current image to the screen
scr.drawImg();
