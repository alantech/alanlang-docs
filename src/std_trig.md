### @std/trig

In `alan` the different fields of math are given their own respective libraries, both to encourage more complete support of each field and to keep them clearly labeled and segmented from each other to reduce noise pollution from differing terminologies amongsth them. Trigonometric functions and constants are housed in this standard library.

There are three numeric constants defined: `e`, `tau`, and `pi`.

`e` is Euler's Number approximately `2.72` and was discovered [while analyzing compound interest](https://en.wikipedia.org/wiki/E_(mathematical_constant)).

`tau` is the number of radians to complete a full circle, approximately `6.28` while `pi` is half that at approximately `3.14`. For historical reasons `pi` is used and cited more often, though `tau` simplifies certain equation forms and the direct ratio between it and percentages on a Pie Chart (eg `25%` on a Pie Chart is equal to `tau / 4`) make it the clearer instructional tool.

The functions provided by `@std/trig` fall into the following categories: Logarithms & Exponents, Basic Trigonometric Functions, Inverse Trigonometric Functions, Historical Trigonometric Functions, Inverse Historical Trigonometric Functions, Hyperbolic Trigonometric Functions, and Inverse Hyperbolic Trigonometric Functions. [Wikipedia has lots of great material on them all](https://en.wikipedia.org/wiki/Trigonometric_functions).

#### Logarithms & Exponents

* `exp(float32): float32`, `exp(float64): float64`
  This function returns the value of `e^x` and is equivalent to `pow(trig.e, x)` but is commonly written this way in trigonometric functions in physics, electrical engineering, etc.
* `ln(float32): float32`, `ln(float64): float64`
  This function returns the natural log (log base-e) of the provided value.
* `log(float32): float32`, `log(float64): float64`
  This function returns log base-10 of the provided value.

#### Basic Trigonometric Functions

* `sin(float32): float32`, `sin(float64): float64`
  Returns the ratio of the opposite side versus the hypotenuse (sine) for the given angle in radians.
* `cos(float32): float32`, `cos(float64): float64`
  Returns the ratio of the adjacent side versus the hypotenuse (cosine) for the given angle in radians.
* `tan(float32): float32`, `tan(float64): float64`
  Returns the ratio of the opposite side versus the adjacent side (tangent) for the given angle in radians.
* `sec(float32): float32`, `sec(float64): float64`
  Returns the ratio of the hypotenuse versus the adjacent side (secant) for the given angle in radians.
* `csc(float32): float32`, `csc(float64): float64`
  Returns the ratio of the hypotenuse versus the opposite side (cosecant) for the given angle in radians.
* `cot(float32): float32`, `cot(float64): float64`
  Returns the ratio of the adjacent side versus the opposite side (cotangent) for the given angle in radians.

#### Inverse Trigonometric Functions

* `arcsin(float32): float32`, `arcsin(float64): float64`
  Returns the angle in radians for the given ratio of the opposite side versus the hypotenuse (arcsine).
* `arccos(float32): float32`, `arccos(float64): float64`
  Returns the angle in radians for the given ratio of the adjacent side versus the hypotenuse (arccosine).
* `arctan(float32): float32`, `arctan(float64): float64`
  Returns the angle in radians for the given ratio of the opposite side versus the adjacent side (arctangent).
* `arcsec(float32): float32`, `arcsec(float64): float64`
  Returns the angle in radians for the given ratio of the hypotenuse versus the adjacent side (arcsecant).
* `arccsc(float32): float32`, `arccsc(float64): float64`
  Returns the angle in radians for the given ratio of the hypotenuse versus the opposite side (arccosecant).
* `arccot(float32): float32`, `arccot(float64): float64`
  Returns the angle in radians for the given ratio of the adjacent side versus the opposite side (arccotangent).

#### Historical Trigonometric Functions

Historically, common forms of the combinations and/or formula fragments using the above trigonometric functions would be precomputed and kept in look-up books as fast computational processes were not available. (To be fair, you don't even need all of the above to define everything, you could redefine everything based on just `sin` and `arcsin`) These forms were often used in computing distances across the globe, for instance, but also ["fill in the blanks" of many line segments that can be traced out by the basic trigonometric functions](https://en.wikipedia.org/wiki/File:Circle-trig6.svg) making them very useful as a teaching aid in trigonometry, as well.

So, because I can, I included EVERY LAST ONE OF THEM.

* `ver(float32): float32`, `ver(float64): float64`
  The `versine` returns the inverse of a `cosine` and shifted up such that the range is from 0 to 2, and is equivalent to the portion of the unit circle radius along the ray of the adjacent side that is not covered by that side.
* `vcs(float32): float32`, `vcs(float64): float64`
  The `vercosine` returns a `cosine` shifted up such that the range is from 0 to 2.
* `cvs(float32): float32`, `cvs(float64): float64`
  The `coversine` returns the inverse of a `sine` shifted up such that the range is from 0 to 2.
* `cvc(float32): float32`, `cvc(float64): float64`
  The `covercosine` returns a `sine` shifted up such that the range is from 0 to 2.
* `hav(float32): float32`, `hav(float64): float64`
  The `haversine` is half a `versine`, such that it is an inverted half `cosine` shifted up such that the range is from 0 to 1. It is an important component in calculating great circle distances on a sphere. It was once used for navigation across the world and still does a decent job at shorter distances but has been overtaken by more precise models of the world.
* `hvc(float32): float32`, `hvc(float64): float64`
  The `havercosine` is half a `vercosine`, it is a half `cosine` that has been shifted up such that the range is from 0 to 1.
* `hcv(float32): float32`, `hcv(float64): float64`
  The `hacoversine` is an inverted half `sine` that has been shifted up such that the range is from 0 to 1.
* `hcc(float32): float32`, `hcc(float64): float64`
  The `hacovercosine` is a half `sine` that has been shifted up such that the range is from 0 to 1.
* `exs(float32): float32`, `exs(float64): float64`
  The `exsecant` is the `secant` minus the unit circle radius of `1`, and is the portion of the secant that falls outside of the unit circle.
* `exc(float32): float32`, `exc(float64): float64`
  The `excosecant` is the `cosecant` minus the unit circle radius of `1`, and is the portion of the cosecant that falls outside of the unit circle.
* `crd(float32): float32`, `crd(float64): float64`
  The `chord` is the straight-line segment connecting the points where the unit circle rays from the hypotenuse and adjacent sides come from, forming a triangle where two sides have a length of `1` and the other the length of the `chord` and is equal to `2` times the `sine` of half the original angle `theta`.

#### Inverse Historical Trigonometric Functions

* `arcver(float32): float32`, `arcver(float64): float64`
  The `arcversine` reverses the `versine` function and returns the original angle defining it.
* `arcvcs(float32): float32`, `arcvcs(float64): float64`
* `arccvs(float32): float32`, `arccvs(float64): float64`
* `arccvc(float32): float32`, `arccvc(float64): float64`
* `archav(float32): float32`, `archav(float64): float64`
* `archvc(float32): float32`, `archvc(float64): float64`
* `archcv(float32): float32`, `archcv(float64): float64`
* `archcc(float32): float32`, `archcc(float64): float64`
* `arcexs(float32): float32`, `arcexs(float64): float64`
* `arcexc(float32): float32`, `arcexc(float64): float64`
* `arccrd(float32): float32`, `arccrd(float64): float64`

#### Hyperbolic Trigonometric Functions

* `sinh(float32): float32`, `sinh(float64): float64`
  Returns the y-axis value of the intersection point of the unit hyperbola with a ray starting at (0, 0) such that the area defined versus the x-axis is half the provided value ([See this diagram](https://en.wikipedia.org/wiki/File:Hyperbolic_functions-2.svg) for more clarity).
* `cosh(float32): float32`, `cosh(float64): float64`
  Returns the x-axis value of the intersection point of the unit hyperbola with a ray starting at (0, 0) such that the area defined versus the x-axis is half the provided value.
* `tanh(float32): float32`, `tanh(float64): float64`
  Returns the ratio between the hyperbolic sine and cosine, bounded from `-1` to `1`.
* `sech(float32): float32`, `sech(float64): float64`
  Returns the one over the hyperbolic cosine.
* `csc(float32): float32`, `csc(float64): float64`
  Returns the one over the hyperbolic sine.
* `cot(float32): float32`, `cot(float64): float64`
  Returns the one over the hyperbolic tangent.

#### Inverse Hyperbolic Trigonometric Functions

* `arcsinh(float32): float32`, `arcsinh(float64): float64`
  Reverses the hyperbolic sine.
* `arccosh(float32): float32`, `arccosh(float64): float64`
* `arctanh(float32): float32`, `arctanh(float64): float64`
* `arcsech(float32): float32`, `arcsech(float64): float64`
* `arccsch(float32): float32`, `arccsch(float64): float64`
* `arccoth(float32): float32`, `arccoth(float64): float64`

