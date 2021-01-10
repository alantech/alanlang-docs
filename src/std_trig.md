### @std/trig

This standard library provides the constants [e](https://simple.wikipedia.org/wiki/E_\(mathematical_constant\)), [pi](https://en.wikipedia.org/wiki/Pi), and [tau](https://math.wikia.org/wiki/Tau_\(constant\)), [all of the trigonometric functions](https://en.wikipedia.org/wiki/List_of_trigonometric_identities), the [hyperbolic functions](https://en.wikipedia.org/wiki/Hyperbolic_functions), the [common](https://en.wikipedia.org/wiki/Common_logarithm) and [natural](https://en.wikipedia.org/wiki/Natural_logarithm) logarithms, and the [exp function](https://en.wikipedia.org/wiki/Exponential_function).

All of the trigonometric functions are exported with `float32` and `float64` support as well as Result-wrapped variants. Most are infallible but some are not. The trigonometric functions are defined with both a short 3-5 character name common in textbooks and a fully-spelled out name. Eg, `sin` is the same as `sine` and `ahcc` is the same as `archacovercosine`. The meanings and uses of the trigonometric functions will not be covered in here as the Wikipedia links in the first paragraph provide a far better and in-depth explanation, including some [great visual diagrams](https://upload.wikimedia.org/wikipedia/commons/9/9d/Circle-trig6.svg) that can elucidate things quickly for those already familiar with the classic `sin`, `cos`, and `tan`. Instead, below will be a listing of the signatures of everything exported by the library.

```alan
e: float64
pi: float64
tau: float64

fn exp(float64): float64
fn exp(Result<float64>): Result<float64>
fn exp(float32): float32
fn exp(Result<float32>): Result<float32>

fn ln(float64): float64
fn ln(float32): float32
fn ln(Result<float64>): Result<float64>
fn ln(Result<float32>): Result<float32>

fn log(float64): float64
fn log(float32): float32
fn log(Result<float64>): Result<float64>
fn log(Result<float32>): Result<float32>

fn sin(float64): float64
fn sin(float32): float32
fn sin(Result<float64>): Result<float64>
fn sin(Result<float32>): Result<float32>
fn sine(float64): float64
fn sine(float32): float32
fn sine(Result<float64>): Result<float64>
fn sine(Result<float32>): Result<float32>

fn cos(float64): float64
fn cos(float32): float32
fn cos(Result<float64>): Result<float64>
fn cos(Result<float32>): Result<float32>
fn cosine(float64): float64
fn cosine(float32): float32
fn cosine(Result<float64>): Result<float64>
fn cosine(Result<float32>): Result<float32>

fn tan(float64): float64
fn tan(float32): float32
fn tan(Result<float64>): Result<float64>
fn tan(Result<float32>): Result<float32>
fn tangent(float64): float64
fn tangent(float32): float32
fn tangent(Result<float64>): Result<float64>
fn tangent(Result<float32>): Result<float32>

fn sec(float64): Result<float64>
fn sec(float32): Result<float32>
fn sec(Result<float64>): Result<float64>
fn sec(Result<float32>): Result<float32>
fn secant(float64): Result<float64>
fn secant(float32): Result<float32>
fn secant(Result<float64>): Result<float64>
fn secant(Result<float32>): Result<float32>

fn csc(float64): Result<float64>
fn csc(float32): Result<float32>
fn csc(Result<float64>): Result<float64>
fn csc(Result<float32>): Result<float32>
fn cosecant(float64): Result<float64>
fn cosecant(float32): Result<float32>
fn cosecant(Result<float64>): Result<float64>
fn cosecant(Result<float32>): Result<float32>

fn cot(float64): Result<float64>
fn cot(float32): Result<float32>
fn cot(Result<float64>): Result<float64>
fn cot(Result<float32>): Result<float32>
fn cotangent(float64): Result<float64>
fn cotangent(float32): Result<float32>
fn cotangent(Result<float64>): Result<float64>
fn cotangent(Result<float32>): Result<float32>

fn asin(float64): float64
fn asin(float32): float32
fn asin(Result<float64>): Result<float64>
fn asin(Result<float32>): Result<float32>
fn arcsine(float64): float64
fn arcsine(float32): float32
fn arcsine(Result<float64>): Result<float64>
fn arcsine(Result<float32>): Result<float32>

fn acos(float64): float64
fn acos(float32): float32
fn acos(Result<float64>): Result<float64>
fn acos(Result<float32>): Result<float32>
fn arccosine(float64): Result<float64>
fn arccosine(float32): Result<float32>
fn arccosine(Result<float64>): Result<float64>
fn arccosine(Result<float32>): Result<float32>

fn atan(float64): float64
fn atan(float32): float32
fn atan(Result<float64>): Result<float64>
fn atan(Result<float32>): Result<float32>
fn arctangent(float64): float64
fn arctangent(float32): float32
fn arctangent(Result<float64>): Result<float64>
fn arctangent(Result<float32>): Result<float32>

fn asec(float64): Result<float64>
fn asec(float32): Result<float32>
fn asec(Result<float64>): Result<float64>
fn asec(Result<float32>): Result<float32>
fn arcsecant(float64): float64
fn arcsecant(float32): float32
fn arcsecant(Result<float64>): Result<float64>
fn arcsecant(Result<float32>): Result<float32>

fn acsc(float64): Result<float64>
fn acsc(float32): Result<float32>
fn acsc(Result<float64>): Result<float64>
fn acsc(Result<float32>): Result<float32>
fn arccosecant(float64): Result<float64>
fn arccosecant(float32): Result<float32>
fn arccosecant(Result<float64>): Result<float64>
fn arccosecant(Result<float32>): Result<float32>

fn acot(float64): Result<float64>
fn acot(float32): Result<float32>
fn acot(Result<float64>): Result<float64>
fn acot(Result<float32>): Result<float32>
fn arccotangent(float64): Result<float64>
fn arccotangent(float32): Result<float32>
fn arccotangent(Result<float64>): Result<float64>
fn arccotangent(Result<float32>): Result<float32>

fn ver(float64): Result<float64>
fn ver(float32): Result<float32>
fn ver(Result<float64>): Result<float64>
fn ver(Result<float32>): Result<float32>
fn versine(float64): Result<float64>
fn versine(float32): Result<float32>
fn versine(Result<float64>): Result<float64>
fn versine(Result<float32>): Result<float32>

fn vcs(float64): Result<float64>
fn vcs(float32): Result<float32>
fn vcs(Result<float64>): Result<float64>
fn vcs(Result<float32>): Result<float32>
fn vercosine(float64): Result<float64>
fn vercosine(float32): Result<float32>
fn vercosine(Result<float64>): Result<float64>
fn vercosine(Result<float32>): Result<float32>

fn cvs(float64): Result<float64>
fn cvs(float32): Result<float32>
fn cvs(Result<float64>): Result<float64>
fn cvs(Result<float32>): Result<float32>
fn coversine(float64): Result<float64>
fn coversine(float32): Result<float32>
fn coversine(Result<float64>): Result<float64>
fn coversine(Result<float32>): Result<float32>

fn cvc(float64): Result<float64>
fn cvc(float32): Result<float32>
fn cvc(Result<float64>): Result<float64>
fn cvc(Result<float32>): Result<float32>
fn covercosine(float64): Result<float64>
fn covercosine(float32): Result<float32>
fn covercosine(Result<float64>): Result<float64>
fn covercosine(Result<float32>): Result<float32>

fn hav(float64): Result<float64>
fn hav(float32): Result<float32>
fn hav(Result<float64>): Result<float64>
fn hav(Result<float32>): Result<float32>
fn haversine(float64): Result<float64>
fn haversine(float32): Result<float32>
fn haversine(Result<float64>): Result<float64>
fn haversine(Result<float32>): Result<float32>

fn hvc(float64): Result<float64>
fn hvc(float32): Result<float32>
fn hvc(Result<float64>): Result<float64>
fn hvc(Result<float32>): Result<float32>
fn havercosine(float64): Result<float64>
fn havercosine(float32): Result<float32>
fn havercosine(Result<float64>): Result<float64>
fn havercosine(Result<float32>): Result<float32>

fn hcv(float64): Result<float64>
fn hcv(float32): Result<float32>
fn hcv(Result<float64>): Result<float64>
fn hcv(Result<float32>): Result<float32>
fn hacoversine(float64): Result<float64>
fn hacoversine(float32): Result<float32>
fn hacoversine(Result<float64>): Result<float64>
fn hacoversine(Result<float32>): Result<float32>

fn hcc(float64): Result<float64>
fn hcc(float32): Result<float32>
fn hcc(Result<float64>): Result<float64>
fn hcc(Result<float32>): Result<float32>
fn hacovercosine(float64): Result<float64>
fn hacovercosine(float32): Result<float32>
fn hacovercosine(Result<float64>): Result<float64>
fn hacovercosine(Result<float32>): Result<float32>

fn exs(float64): Result<float64>
fn exs(float32): Result<float32>
fn exs(Result<float64>): Result<float64>
fn exs(Result<float32>): Result<float32>
fn exsecant(float64): Result<float64>
fn exsecant(float32): Result<float32>
fn exsecant(Result<float64>): Result<float64>
fn exsecant(Result<float32>): Result<float32>

fn exc(float64): Result<float64>
fn exc(float32): Result<float32>
fn exc(Result<float64>): Result<float64>
fn exc(Result<float32>): Result<float32>
fn excosecant(float64): Result<float64>
fn excosecant(float32): Result<float32>
fn excosecant(Result<float64>): Result<float64>
fn excosecant(Result<float32>): Result<float32>

fn crd(float64): Result<float64>
fn crd(float32): Result<float32>
fn crd(Result<float64>): Result<float64>
fn crd(Result<float32>): Result<float32>
fn chord(float64): Result<float64>
fn chord(float32): Result<float32>
fn chord(Result<float64>): Result<float64>
fn chord(Result<float32>): Result<float32>

fn aver(float64): Result<float64>
fn aver(float32): Result<float32>
fn aver(Result<float64>): Result<float64>
fn aver(Result<float32>): Result<float32>
fn arcversine(float64): Result<float64>
fn arcversine(float32): Result<float32>
fn arcversine(Result<float64>): Result<float64>
fn arcversine(Result<float32>): Result<float32>

fn avcs(float64): Result<float64>
fn avcs(float32): Result<float32>
fn avcs(Result<float64>): Result<float64>
fn avcs(Result<float32>): Result<float32>
fn arcvercosine(float64): Result<float64>
fn arcvercosine(float32): Result<float32>
fn arcvercosine(Result<float64>): Result<float64>
fn arcvercosine(Result<float32>): Result<float32>

fn acvs(float64): Result<float64>
fn acvs(float32): Result<float32>
fn acvs(Result<float64>): Result<float64>
fn acvs(Result<float32>): Result<float32>
fn arccoversine(float64): Result<float64>
fn arccoversine(float32): Result<float32>
fn arccoversine(Result<float64>): Result<float64>
fn arccoversine(Result<float32>): Result<float32>

fn acvc(float64): Result<float64>
fn acvc(float32): Result<float32>
fn acvc(Result<float64>): Result<float64>
fn acvc(Result<float32>): Result<float32>
fn arccovercosine(float64): Result<float64>
fn arccovercosine(float32): Result<float32>
fn arccovercosine(Result<float64>): Result<float64>
fn arccovercosine(Result<float32>): Result<float32>

fn ahav(float64): Result<float64>
fn ahav(float32): Result<float32>
fn ahav(Result<float64>): Result<float64>
fn ahav(Result<float32>): Result<float32>
fn archaversine(float64): Result<float64>
fn archaversine(float32): Result<float32>
fn archaversine(Result<float64>): Result<float64>
fn archaversine(Result<float32>): Result<float32>

fn ahvc(float64): Result<float64>
fn ahvc(float32): Result<float32>
fn ahvc(Result<float64>): Result<float64>
fn ahvc(Result<float32>): Result<float32>
fn archavercosine(float64): Result<float64>
fn archavercosine(float32): Result<float32>
fn archavercosine(Result<float64>): Result<float64>
fn archavercosine(Result<float32>): Result<float32>

fn ahcv(float64): Result<float64>
fn ahcv(float32): Result<float32>
fn ahcv(Result<float64>): Result<float64>
fn ahcv(Result<float32>): Result<float32>
fn archacoversine(float64): Result<float64>
fn archacoversine(float32): Result<float32>
fn archacoversine(Result<float64>): Result<float64>
fn archacoversine(Result<float32>): Result<float32>

fn ahcc(float64): Result<float64>
fn ahcc(float32): Result<float32>
fn ahcc(Result<float64>): Result<float64>
fn ahcc(Result<float32>): Result<float32>
fn archacovercosine(float64): Result<float64>
fn archacovercosine(float32): Result<float32>
fn archacovercosine(Result<float64>): Result<float64>
fn archacovercosine(Result<float32>): Result<float32>

fn aexs(float64): Result<float64>
fn aexs(float32): Result<float32>
fn aexs(Result<float64>): Result<float64>
fn aexs(Result<float32>): Result<float32>
fn arcexsecant(float64): Result<float64>
fn arcexsecant(float32): Result<float32>
fn arcexsecant(Result<float64>): Result<float64>
fn arcexsecant(Result<float32>): Result<float32>

fn aexc(float64): Result<float64>
fn aexc(float32): Result<float32>
fn aexc(Result<float64>): Result<float64>
fn aexc(Result<float32>): Result<float32>
fn arcexcosecant(float64): Result<float64>
fn arcexcosecant(float32): Result<float32>
fn arcexcosecant(Result<float64>): Result<float64>
fn arcexcosecant(Result<float32>): Result<float32>

fn acrd(float64): Result<float64>
fn acrd(float32): Result<float32>
fn acrd(Result<float64>): Result<float64>
fn acrd(Result<float32>): Result<float32>
fn arcchord(float64): Result<float64>
fn arcchord(float32): Result<float32>
fn arcchord(Result<float64>): Result<float64>
fn arcchord(Result<float32>): Result<float32>

fn sinh(float64): float64
fn sinh(float32): float32
fn sinh(Result<float64>): Result<float64>
fn sinh(Result<float32>): Result<float32>
fn hyperbolicSine(float64): float64
fn hyperbolicSine(float32): float32
fn hyperbolicSine(Result<float64>): Result<float64>
fn hyperbolicSine(Result<float32>): Result<float32>

fn cosh(float64): float64
fn cosh(float32): float32
fn cosh(Result<float64>): Result<float64>
fn cosh(Result<float32>): Result<float32>
fn hyperbolicCosine(float64): float64
fn hyperbolicCosine(float32): float32
fn hyperbolicCosine(Result<float64>): Result<float64>
fn hyperbolicCosine(Result<float32>): Result<float32>

fn tanh(float64): float64
fn tanh(float32): float32
fn tanh(Result<float64>): Result<float64>
fn tanh(Result<float32>): Result<float32>
fn hyperbolicTangent(float64): float64
fn hyperbolicTangent(float32): float32
fn hyperbolicTangent(Result<float64>): Result<float64>
fn hyperbolicTangent(Result<float32>): Result<float32>

fn sech(float64): Result<float64>
fn sech(float32): Result<float32>
fn sech(Result<float64>): Result<float64>
fn sech(Result<float32>): Result<float32>
fn hyperbolicSecant(float64): Result<float64>
fn hyperbolicSecant(float32): Result<float32>
fn hyperbolicSecant(Result<float64>): Result<float64>
fn hyperbolicSecant(Result<float32>): Result<float32>

fn csch(float64): Result<float64>
fn csch(float32): Result<float32>
fn csch(Result<float64>): Result<float64>
fn csch(Result<float32>): Result<float32>
fn hyperbolicCosecant(float64): Result<float64>
fn hyperbolicCosecant(float32): Result<float32>
fn hyperbolicCosecant(Result<float64>): Result<float64>
fn hyperbolicCosecant(Result<float32>): Result<float32>

fn coth(float64): Result<float64>
fn coth(float32): Result<float32>
fn coth(Result<float64>): Result<float64>
fn coth(Result<float32>): Result<float32>
fn hyperbolicCotangent(float64): Result<float64>
fn hyperbolicCotangent(float32): Result<float32>
fn hyperbolicCotangent(Result<float64>): Result<float64>
fn hyperbolicCotangent(Result<float32>): Result<float32>

fn asinh(float64): Result<float64>
fn asinh(float32): Result<float32>
fn asinh(Result<float64>): Result<float64>
fn asinh(Result<float32>): Result<float32>
fn hyperbolicArcsine(float64): Result<float64>
fn hyperbolicArcsine(float32): Result<float32>
fn hyperbolicArcsine(Result<float64>): Result<float64>
fn hyperbolicArcsine(Result<float32>): Result<float32>

fn acosh(float64): Result<float64>
fn acosh(float32): Result<float32>
fn acosh(Result<float64>): Result<float64>
fn acosh(Result<float32>): Result<float32>
fn hyperbolicArccosine(float64): Result<float64>
fn hyperbolicArccosine(float32): Result<float32>
fn hyperbolicArccosine(Result<float64>): Result<float64>
fn hyperbolicArccosine(Result<float32>): Result<float32>

fn atanh(float64): Result<float64>
fn atanh(float32): Result<float32>
fn atanh(Result<float64>): Result<float64>
fn atanh(Result<float32>): Result<float32>
fn hyperbolicArctangent(float64): Result<float64>
fn hyperbolicArctangent(float32): Result<float32>
fn hyperbolicArctangent(Result<float64>): Result<float64>
fn hyperbolicArctangent(Result<float32>): Result<float32>

fn asech(float64): Result<float64>
fn asech(float32): Result<float32>
fn asech(Result<float64>): Result<float64>
fn asech(Result<float32>): Result<float32>
fn hyperbolicArcsecant(float64): Result<float64>
fn hyperbolicArcsecant(float32): Result<float32>
fn hyperbolicArcsecant(Result<float64>): Result<float64>
fn hyperbolicArcsecant(Result<float32>): Result<float32>

fn acsch(float64): Result<float64>
fn acsch(float32): Result<float32>
fn acsch(Result<float64>): Result<float64>
fn acsch(Result<float32>): Result<float32>
fn hyperbolicArccosecant(float64): Result<float64>
fn hyperbolicArccosecant(float32): Result<float32>
fn hyperbolicArccosecant(Result<float64>): Result<float64>
fn hyperbolicArccosecant(Result<float32>): Result<float32>

fn acoth(float64): Result<float64>
fn acoth(float32): Result<float32>
fn acoth(Result<float64>): Result<float64>
fn acoth(Result<float32>): Result<float32>
fn hyperbolicArccotangent(float64): Result<float64>
fn hyperbolicArccotangent(float32): Result<float32>
fn hyperbolicArccotangent(Result<float64>): Result<float64>
fn hyperbolicArccotangent(Result<float32>): Result<float32>
```