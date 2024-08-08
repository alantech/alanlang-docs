# The Alan Programming Language

## A GPGPU-native programming language for the rest of us.

<!-- TODO: Fork Pygments, add my own Alan syntax highlighting -->
```rs title="Hello, GPU"
export fn main {
  // Create a buffer of memory on the GPU
  let b = GBuffer([1, 2, 3, 4]);
  // Map the values into a new buffer on the GPU
  let out = b.map(fn (val: gi32) -> gi32 = val + 2);
  // Read the results back to RAM and print them
  out.read{i32}.print;
}
```

[Get Started with Alan](/getting_started){ .md-button .md-button--primary }

??? question "Looking for Alan v0.1?"

    Documentation for Alan v0.1 can be found on [the legacy documentation website](https://docs-legacy.alan-lang.org)

## Why Alan?

Utilizing GPUs for general-purpose computing (GPGPU) has been a difficult ask for developers, with various unsatisfying trade-offs. You must either:

* Tie yourself to a singular GPU vendor with a low-level C++-like language like [CUDA](https://developer.nvidia.com/cuda-toolkit) or [ROCm](https://www.amd.com/en/products/software/rocm.html)
* Choose a platform to target (Windows, Mac, Linux, Web) which chooses the framework to use ([DirectX](https://learn.microsoft.com/en-us/windows/win32/directx), [Metal](https://developer.apple.com/metal/), [Vulkan](https://www.vulkan.org/), [WebGPU](https://www.w3.org/TR/webgpu/)) and requires you write part of your program in a specific shading language ([HLSL](https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl), [MSL](https://developer.apple.com/metal/Metal-Shading-Language-Specification.pdf), [GLSL](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language), [WGSL](https://www.w3.org/TR/WGSL/))
* Use a wrapper library, generally only in interpreted languages, that exposes some but not all of the GPGPU power, with trade-offs and a not-quite-native syntax, like [PyTorch](https://pytorch.org/) or [GPU.js](https://gpu.rocks/#/).

Alan is being designed from the ground up around the idea of GPGPU as a first-class citizen in a higher-level typed language like [Nim](https://nim-lang.org/) or [Crystal](https://crystal-lang.org/) that compiles to native code, or can compile to Javascript for use on the Web.

This means that CPU code written in idiomatic Alan should have roughly the same performance as idiomatic Rust code (the default target language for Alan), while GPU code written in Alan can mix and match CPU and GPU types as desired, and Alan will generate the necessary WGSL shader for you, even when mixing in branching logic like conditionals -- something not even GPU.js can do as it has no ability to alter the behavior of the JS interpreter to follow both branches of a conditional statement for AST generation.

[Get to Know Alan](/overview){ .md-button .md-button--primary }

## Learn Alan

Ready to learn more about Alan? Checkout the [basic tutorial](./tutorial) to become dangerous with Alan, dig into the [built-in types, functions, and operators](./built_ins) automatically available to every Alan module, deep dive into [the standard library](./standard_library) of Alan, or read some [articles](./blog) on Alan for projects that have used it or interesting patterns to take for yourself.

![Alan Logo](./assets/logo.png)
