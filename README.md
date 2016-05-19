# Ray Tracer Practice
This is just a simple set of html and javascript files that I am using to quickly iterate over some practice algorithms for ray tracing.

# A Few Notes
- This is not meant to be a fast or real time Ray Tracer
- I chose to work on these examples with javascript and the html5 canvas, so that I wouldn't have to mess with a heavy graphics and/or windowing API (I'm looking at you SDL, LWJGL, and Swing), or compile any code
- This allows these examples to focus on the essence of ray tracing
- I wrote the Javascript using some nifty ES6 features. Your browser may not support them. Look at this [compatibility check](https://kangax.github.io/compat-table/es6/) to find out. You can transpile with babel or switch browsers if needed
- If you really want to understand this stuff but you are lost. The linear algebra course on Khan Academy is your friend

# How to Use
``` shell
git clone https://github.com/nickmyers217/raytracer_practice
cd raytracer_practice
xdg-open [pick an html file] # This just opens it in your default browser on linux
```
- Each file iterates over the previous one in order to add some new functionality
- I did my best to make things readable and well documented (for my future self and others)
