// A class for creating a pixel buffer and manipulating the pixels inside it
const Img = class
{
	// An image has an array of pixels
	// Each pixel contains a color
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.pixels = [];

		// Store a black color in each pixel
		for(let p = 0; p < width * height; p++) {
			this.pixels.push(new Color());
		}
	}

	// Get the color of the pixel at x, y
	getPixel(x, y) {
		return this.pixels[y * this.width + x];
	}

	// Set the color of the pixel at x, y
	setPixel(x, y, c) {
		this.pixels[y * this.width + x] = c;
	}

	// Randomize every pixel color for test purposes
	setRandom() {
		for(let i = 0; i < this.pixels.length; i++) {
			this.pixels[i] = new Color(
					Math.floor(Math.random() * 255),
					Math.floor(Math.random() * 255),
					Math.floor(Math.random() * 255),
					255);
		}
	}

	// Convert the pixel array to a byte buffer
	toBytes() {
		let bytes = [];

		for(let i = 0; i < this.pixels.length; i++) {
			let p = this.pixels[i];
			bytes.push(p.r);
			bytes.push(p.g);
			bytes.push(p.b);
			bytes.push(p.a);
		}

		return bytes;
	}
}


// A class for creating a canvas and drawing a pixel buffer to it
const Screen = class
{
	// The canvas' default resolution will be 640 x 480
	constructor(width = 640, height = 480) {
		this.width = width;
		this.height = height;
		this.ctx = this.createCtx(width, height);
		this.img = new Img(width, height);
	}

	createCtx(w, h) {
		let canvas = document.getElementById('canvas');
		canvas.width = w;
		canvas.height = h;
		return canvas.getContext('2d');
	}

	drawImg() {
		let destBuff = this.ctx.createImageData(this.width, this.height);
		let srcBuff = this.img.toBytes();
		for(let i = 0; i < srcBuff.length; i++) {
			destBuff.data[i] = srcBuff[i];
		}
		this.ctx.putImageData(destBuff, 0, 0);
	}
}
