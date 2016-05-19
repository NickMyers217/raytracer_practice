// A minimal 2D vector class
const Vec2 = class
{
	// A 2D vector needs an x and y component
	// The default is (0.0, 0.0)
	constructor(x = 0.0, y = 0.0) {
		this.x = x;
		this.y = y;
	}

	// Add 2 Vec2's together and get a new Vec2 back
	add({ x, y }) {
		return new Vec2(this.x + x, this.y + y);
	}

	// Subtract 2 Vec2's
	sub({ x, y }) {
		return new Vec2(this.x - x, this.y - y);
	}
}


// A minimal 3D vector class
const Vec3 = class
{
	// A 3D vector needs an x, y, and z component
	// Defaults to zero
	constructor(x = 0.0, y = 0.0, z = 0.0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	// Add two Vec3's together
	add({ x, y, z }) {
		return new Vec3(this.x + x, this.y + y, this.z + z);
	}

	// Subtract two Vec3's
	sub({ x, y, z }) {
		return new Vec3(this.x - x, this.y - y, this.z - z);
	}

	// Compute the magnitude
	mag() {
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	}

	// Normalize a Vec3 and return a new one
	// TODO: Unit test this
	normalize() {
		const m = this.mag();

		return new Vec3(this.x / m, this.y / m, this.z / m);
	}

	// Compute the dot product of 2 Vec3's
	dot({ x, y, z }) {
		return this.x * x + this.y * y + this.z * z;
	}

	// Swizzle the x and y components
	xy() { return new Vec2(this.x, this.y); }

	// Swizzle the y and z components
	yz() { return new Vec2(this.y, this.z); }

	// Swizzle the x and z components
	xz() { return new Vec2(this.x, this.z); }
}


// A minimal color class
const Color = class
{
	// A color has an red, green, blue, and alpha value, each from 0 to 255
	// The default is black (0, 0, 0, 255)
	// The alpha must be 255 to ensure full visibility
	constructor(r = 0, b = 0, g = 0, a = 255) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	// Convert the color into an array of 4 bytes
	toArr() {
		return [this.r, this.g, this.b, this.a];
	}
}
