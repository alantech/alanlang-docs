### @std/trig

This standard library provides the constants [e](https://simple.wikipedia.org/wiki/E_\(mathematical_constant\)), [pi](https://en.wikipedia.org/wiki/Pi), and [tau](https://math.wikia.org/wiki/Tau_\(constant\)), [all of the trigonometric functions](https://en.wikipedia.org/wiki/List_of_trigonometric_identities), the [hyperbolic functions](https://en.wikipedia.org/wiki/Hyperbolic_functions), the [common](https://en.wikipedia.org/wiki/Common_logarithm) and [natural](https://en.wikipedia.org/wiki/Natural_logarithm) logarithms, and the [exp function](https://en.wikipedia.org/wiki/Exponential_function).

All of the trigonometric functions are exported with both `float32` and `float64` support, and with both a short 3-5 character name common in textbooks and a fully-spelled out name. Eg, `sin` is the same as `sine` and `ahcc` is the same as `archacovercosine`. The meanings and uses of the trigonometric functions will not be covered in here as the Wikipedia links in the first paragraph provide a far better and in-depth explanation, including some [great visual diagrams](https://upload.wikimedia.org/wikipedia/commons/9/9d/Circle-trig6.svg) that can elucidate things quickly for those already familiar with the classic `sin`, `cos`, and `tan`. Instead, below will be a listing of the signatures of everything exported by the library.

```rust
e: float64
pi: float64
tau: float64

fn exp(float64): float64
fn exp(float32): float32

fn ln(x: float64): float64
fn ln(x: float32): float32

fn log(x: float64): float64
fn log(x: float32): float32

fn sin(x: float64): float64
fn sin(x: float32): float32
fn sine(x: float64): float64
fn sine(x: float32): float32

fn cos(x: float64): float64
fn cos(x: float32): float32
fn cosine(x: float64): float64
fn cosine(x: float32): float32

fn tan(x: float64): float64
fn tan(x: float32): float32
fn tangent(x: float64): float64
fn tangent(x: float32): float32

fn sec(x: float64): float64
fn sec(x: float32): float32
fn secant(x: float64): float64
fn secant(x: float32): float32

fn csc(x: float64): float64
fn csc(x: float32): float32
fn cosecant(x: float64): float64
fn cosecant(x: float32): float32

fn cot(x: float64): float64
fn cot(x: float32): float32
fn cotangent(x: float64): float64
fn cotangent(x: float32): float32

fn asin(x: float64): float64
fn asin(x: float32): float32
fn arcsine(x: float64): float64
fn arcsine(x: float32): float32

fn acos(x: float64): float64
fn acos(x: float32): float32
fn arccosine(x: float64): float64
fn arccosine(x: float32): float32

fn atan(x: float64): float64
fn atan(x: float32): float32
fn arctangent(x: float64): float64
fn arctangent(x: float32): float32

fn asec(x: float64): float64
fn asec(x: float32): float32
fn arcsecant(x: float64): float64
fn arcsecant(x: float32): float32

fn acsc(x: float64): float64
fn acsc(x: float32): float32
fn arccosecant(x: float64): float64
fn arccosecant(x: float32): float32

fn acot(x: float64): float64
fn acot(x: float32): float32
fn arccotangent(x: float64): float64
fn arccotangent(x: float32): float32

fn ver(x: float64): float64
fn ver(x: float32): float32
fn versine(x: float64): float64
fn versine(x: float32): float32

fn vcs(x: float64): float64
fn vcs(x: float32): float32
fn vercosine(x: float64): float64
fn vercosine(x: float32): float32

fn cvs(x: float64): float64
fn cvs(x: float32): float32
fn coversine(x: float64): float64
fn coversine(x: float32): float32

fn cvc(x: float64): float64
fn cvc(x: float32): float32
fn covercosine(x: float64): float64
fn covercosine(x: float32): float32

fn hav(x: float64): float64
fn hav(x: float32): float32
fn haversine(x: float64): float64
fn haversine(x: float32): float32

fn hvc(x: float64): float64
fn hvc(x: float32): float32
fn havercosine(x: float64): float64
fn havercosine(x: float32): float32

fn hcv(x: float64): float64
fn hcv(x: float32): float32
fn hacoversine(x: float64): float64
fn hacoversine(x: float32): float32

fn hcc(x: float64): float64
fn hcc(x: float32): float32
fn hacovercosine(x: float64): float64
fn hacovercosine(x: float32): float32

fn exs(x: float64): float64
fn exs(x: float32): float32
fn exsecant(x: float64): float64
fn exsecant(x: float32): float32

fn exc(x: float64): float64
fn exc(x: float32): float32
fn excosecant(x: float64): float64
fn excosecant(x: float32): float32

fn crd(x: float64): float64
fn crd(x: float32): float32
fn chord(x: float64): float64
fn chord(x: float32): float32

fn aver(x: float64): float64
fn aver(x: float32): float32
fn arcversine(x: float64): float64
fn arcversine(x: float32): float32

fn avcs(x: float64): float64
fn avcs(x: float32): float32
fn arcvercosine(x: float64): float64
fn arcvercosine(x: float32): float32

fn acvs(x: float64): float64
fn acvs(x: float32): float32
fn arccoversine(x: float64): float64
fn arccoversine(x: float32): float32

fn acvc(x: float64): float64
fn acvc(x: float32): float32
fn arccovercosine(x: float64): float64
fn arccovercosine(x: float32): float32

fn ahav(x: float64): float64
fn ahav(x: float32): float32
fn archaversine(x: float64): float64
fn archaversine(x: float32): float32

fn ahvc(x: float64): float64
fn ahvc(x: float32): float32
fn archavercosine(x: float64): float64
fn archavercosine(x: float32): float32

fn ahcv(x: float64): float64
fn ahcv(x: float32): float32
fn archacoversine(x: float64): float64
fn archacoversine(x: float32): float32

fn ahcc(x: float64): float64
fn ahcc(x: float32): float32
fn archacovercosine(x: float64): float64
fn archacovercosine(x: float32): float32

fn aexs(x: float64): float64
fn aexs(x: float32): float32
fn arcexsecant(x: float64): float64
fn arcexsecant(x: float32): float32

fn aexc(x: float64): float64
fn aexc(x: float32): float32
fn arcexcosecant(x: float64): float64
fn arcexcosecant(x: float32): float32

fn acrd(x: float64): float64
fn acrd(x: float32): float32
fn arcchord(x: float64): float64
fn arcchord(x: float32): float32

fn sinh(x: float64): float64
fn sinh(x: float32): float32
fn hyperbolicSine(x: float64): float64
fn hyperbolicSine(x: float32): float32

fn cosh(x: float64): float64
fn cosh(x: float32): float32
fn hyperbolicCosine(x: float64): float64
fn hyperbolicCosine(x: float32): float32

fn tanh(x: float64): float64
fn tanh(x: float32): float32
fn hyperbolicTangent(x: float64): float64
fn hyperbolicTangent(x: float32): float32

fn sech(x: float64): float64
fn sech(x: float32): float32
fn hyperbolicSecant(x: float64): float64
fn hyperbolicSecant(x: float32): float32

fn csch(x: float64): float64
fn csch(x: float32): float32
fn hyperbolicCosecant(x: float64): float64
fn hyperbolicCosecant(x: float32): float32

fn coth(x: float64): float64
fn coth(x: float32): float32
fn hyperbolicCotangent(x: float64): float64
fn hyperbolicCotangent(x: float32): float32

fn asinh(x: float64): float64
fn asinh(x: float32): float32
fn hyperbolicArcsine(x: float64): float64
fn hyperbolicArcsine(x: float32): float32

fn acosh(x: float64): float64
fn acosh(x: float32): float32
fn hyperbolicArccosine(x: float64): float64
fn hyperbolicArccosine(x: float32): float32

fn atanh(x: float64): float64
fn atanh(x: float32): float32
fn hyperbolicArctangent(x: float64): float64
fn hyperbolicArctangent(x: float32): float32

fn asech(x: float64): float64
fn asech(x: float32): float32
fn hyperbolicArcsecant(x: float64): float64
fn hyperbolicArcsecant(x: float32): float32

fn acsch(x: float64): float64
fn acsch(x: float32): float32
fn hyperbolicArccosecant(x: float64): float64
fn hyperbolicArccosecant(x: float32): float32

fn acoth(x: float64): float64
fn acoth(x: float32): float32
fn hyperbolicArccotangent(x: float64): float64
fn hyperbolicArccotangent(x: float32): float32
```