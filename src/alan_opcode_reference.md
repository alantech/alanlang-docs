## Alan Opcode Reference

The [Alan Standard Library](./standard_library.md), [AMM](./amm_language_reference.md), and [AGA](./aga_language_reference.md) formats all make extensive use of opcodes defined within the runtime to do useful work.

The Alan runtime opcodes are identified with a 64-bit integer and have exactly 3 64-bit arguments. The 64-bit integers have been chosen to match a space-padded string of the name of the opcode (therefore allowing the opcodes to have names from 1-8 ASCII characters long). Most opcodes use the first two arguments as input addresses and the last argument as an output address, but some treat them as constants, event ids, or ignored values.

The following table will specify the opcode name followed by the three arguments (arg0, arg1, arg2) with the kind of argument given (IN = Input Address, OUT = Output Address, CONST = Constant Value, EVENT = Event Name, NULL = Ignored) and then a short description of what that opcode does. A few opcodes will have an UNSAFE flag on them in their description. These opcodes can potentially crash the runtime if called incorrectly and rely on the compiler to use them wisely.

<table>
  <thead>
    <tr>
      <td>Opcode</td><td>arg0</td><td>arg1</td><td>arg2</td><td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>i8f64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i8 to an f64</td>
    </tr>
    <tr>
      <td><code>i16f64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i16 to an f64</td>
    </tr>
    <tr>
      <td><code>i32f64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i32 to an f64</td>
    </tr>
    <tr>
      <td><code>i64f64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i64 to an f64</td>
    </tr>
    <tr>
      <td><code>f32f64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f32 to an f64</td>
    </tr>
    <tr>
      <td><code>strf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a string to an f64</td>
    </tr>
    <tr>
      <td><code>boolf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a bool to an f64</td>
    </tr>
    <tr>
      <td><code>i8f32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i8 to an f32</td>
    </tr>
    <tr>
      <td><code>i16f32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i16 to an f32</td>
    </tr>
    <tr>
      <td><code>i32f32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i32 to an f32</td>
    </tr>
    <tr>
      <td><code>i64f32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i64 to an f32</td>
    </tr>
    <tr>
      <td><code>f64f32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f64 to an f32</td>
    </tr>
    <tr>
      <td><code>strf32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a string to an f32</td>
    </tr>
    <tr>
      <td><code>boolf32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a bool to an f32</td>
    </tr>
    <tr>
      <td><code>i8i64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i8 to an i64</td>
    </tr>
    <tr>
      <td><code>i16i64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i16 to an i64</td>
    </tr>
    <tr>
      <td><code>i32i64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i32 to an i64</td>
    </tr>
    <tr>
      <td><code>f32i64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f32 to an i64</td>
    </tr>
    <tr>
      <td><code>f64i64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f64 to an i64</td>
    </tr>
    <tr>
      <td><code>stri64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a string to an i64</td>
    </tr>
    <tr>
      <td><code>booli64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a bool to an i64</td>
    </tr>
    <tr>
      <td><code>i8i32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i8 to an i32</td>
    </tr>
    <tr>
      <td><code>i16i32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i16 to an i32</td>
    </tr>
    <tr>
      <td><code>i64i32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i64 to an i32</td>
    </tr>
    <tr>
      <td><code>f32i32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f32 to an i32</td>
    </tr>
    <tr>
      <td><code>f64i32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f64 to an i32</td>
    </tr>
    <tr>
      <td><code>stri32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a string to an i32</td>
    </tr>
    <tr>
      <td><code>booli32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a bool to an i32</td>
    </tr>
    <tr>
      <td><code>i8i16</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i8 to an i16</td>
    </tr>
    <tr>
      <td><code>i32i16</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i32 to an i16</td>
    </tr>
    <tr>
      <td><code>i64i16</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i64 to an i16</td>
    </tr>
    <tr>
      <td><code>f32i16</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f32 to an i16</td>
    </tr>
    <tr>
      <td><code>f64i16</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f64 to an i16</td>
    </tr>
    <tr>
      <td><code>stri16</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a string to an i16</td>
    </tr>
    <tr>
      <td><code>booli16</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a bool to an i16</td>
    </tr>
    <tr>
      <td><code>i16i8</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i16 to an i8</td>
    </tr>
    <tr>
      <td><code>i32i8</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i32 to an i8</td>
    </tr>
    <tr>
      <td><code>i64i8</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i64 to an i8</td>
    </tr>
    <tr>
      <td><code>f32i8</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f32 to an i8</td>
    </tr>
    <tr>
      <td><code>f64i8</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f64 to an i8</td>
    </tr>
    <tr>
      <td><code>stri8</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a string to an i8</td>
    </tr>
    <tr>
      <td><code>booli8</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a bool to an i8</td>
    </tr>
    <tr>
      <td><code>i8bool</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i8 to a bool</td>
    </tr>
    <tr>
      <td><code>i16bool</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i16 to a bool</td>
    </tr>
    <tr>
      <td><code>i32bool</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i32 to a bool</td>
    </tr>
    <tr>
      <td><code>i64bool</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i64 to a bool</td>
    </tr>
    <tr>
      <td><code>f32bool</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f32 to a bool</td>
    </tr>
    <tr>
      <td><code>f64bool</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f64 to a bool</td>
    </tr>
    <tr>
      <td><code>strbool</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a string to a bool</td>
    </tr>
    <tr>
      <td><code>i8str</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i8 to a string</td>
    </tr>
    <tr>
      <td><code>i16str</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i16 to a string</td>
    </tr>
    <tr>
      <td><code>i32str</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i32 to a string</td>
    </tr>
    <tr>
      <td><code>i64str</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an i64 to a string</td>
    </tr>
    <tr>
      <td><code>f32str</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f32 to a string</td>
    </tr>
    <tr>
      <td><code>f64str</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts an f64 to a string</td>
    </tr>
    <tr>
      <td><code>boolstr</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Converts a bool to a string</td>
    </tr>
    <tr>
      <td><code>addi8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Adds two i8's together</td>
    </tr>
    <tr>
      <td><code>addi16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Adds two i16's together</td>
    </tr>
    <tr>
      <td><code>addi32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Adds two i32's together</td>
    </tr>
    <tr>
      <td><code>addi64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Adds two i64's together</td>
    </tr>
    <tr>
      <td><code>addf32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Adds two f32's together</td>
    </tr>
    <tr>
      <td><code>addf64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Adds two f64's together</td>
    </tr>
    <tr>
      <td><code>subi8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Subtracts the second i8 from the first</td>
    </tr>
    <tr>
      <td><code>subi16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Subtracts the second i16 from the first</td>
    </tr>
    <tr>
      <td><code>subi32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Subtracts the second i32 from the first</td>
    </tr>
    <tr>
      <td><code>subi64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Subtracts the second i64 from the first</td>
    </tr>
    <tr>
      <td><code>subf32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Subtracts the second f32 from the first</td>
    </tr>
    <tr>
      <td><code>subf64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Subtracts the second f64 from the first</td>
    </tr>
    <tr>
      <td><code>negi8</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Negates the i8</td>
    </tr>
    <tr>
      <td><code>negi16</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Negates the i16</td>
    </tr>
    <tr>
      <td><code>negi32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Negates the i32</td>
    </tr>
    <tr>
      <td><code>negi64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Negates the i64</td>
    </tr>
    <tr>
      <td><code>negf32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Negates the f32</td>
    </tr>
    <tr>
      <td><code>negf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Negates the f64</td>
    </tr>
    <tr>
      <td><code>absi8</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Makes the i8 magnitude positive</td>
    </tr>
    <tr>
      <td><code>absi16</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Makes the i16 magnitude positive</td>
    </tr>
    <tr>
      <td><code>absi32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Makes the i32 magnitude positive</td>
    </tr>
    <tr>
      <td><code>absi64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Makes the i64 magnitude positive</td>
    </tr>
    <tr>
      <td><code>absf32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Makes the f32 magnitude positive</td>
    </tr>
    <tr>
      <td><code>absf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Makes the f64 magnitude positive</td>
    </tr>
    <tr>
      <td><code>muli8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Multiplies the two i8's together</td>
    </tr>
    <tr>
      <td><code>muli16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Multiplies the two i16's together</td>
    </tr>
    <tr>
      <td><code>muli32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Multiplies the two i32's together</td>
    </tr>
    <tr>
      <td><code>muli64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Multiplies the two i64's together</td>
    </tr>
    <tr>
      <td><code>mulf32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Multiplies the two f32's together</td>
    </tr>
    <tr>
      <td><code>mulf64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Multiplies the two f64's together</td>
    </tr>
    <tr>
      <td><code>divi8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Divides the first i8 by the second</td>
    </tr>
    <tr>
      <td><code>divi16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Divides the first i16 by the second</td>
    </tr>
    <tr>
      <td><code>divi32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Divides the first i32 by the second</td>
    </tr>
    <tr>
      <td><code>divi64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Divides the first i64 by the second</td>
    </tr>
    <tr>
      <td><code>divf32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Divides the first f32 by the second</td>
    </tr>
    <tr>
      <td><code>divf64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Divides the first f64 by the second</td>
    </tr>
    <tr>
      <td><code>modi8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Divides the first i8 by the second and returns the remainder</td>
    </tr>
    <tr>
      <td><code>modi16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Divides the first i16 by the second and returns the remainder</td>
    </tr>
    <tr>
      <td><code>modi32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Divides the first i32 by the second and returns the remainder</td>
    </tr>
    <tr>
      <td><code>modi64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Divides the first i64 by the second and returns the remainder</td>
    </tr>
    <tr>
      <td><code>powi8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Raises the first i8 by the second's power</td>
    </tr>
    <tr>
      <td><code>powi16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Raises the first i16 by the second's power</td>
    </tr>
    <tr>
      <td><code>powi32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Raises the first i32 by the second's power</td>
    </tr>
    <tr>
      <td><code>powi64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Raises the first i64 by the second's power</td>
    </tr>
    <tr>
      <td><code>powf32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Raises the first f32 by the second's power</td>
    </tr>
    <tr>
      <td><code>powf64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Raises the first f64 by the second's power</td>
    </tr>
    <tr>
      <td><code>sqrtf32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the square root of the f32</td>
    </tr>
    <tr>
      <td><code>sqrtf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the square root of the f64</td>
    </tr>
    <tr>
      <td><code>andi8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise and of the two i8's</td>
    </tr>
    <tr>
      <td><code>andi16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise and of the two i16's</td>
    </tr>
    <tr>
      <td><code>andi32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise and of the two i32's</td>
    </tr>
    <tr>
      <td><code>andi64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise and of the two i64's</td>
    </tr>
    <tr>
      <td><code>andbool</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the boolean and of the two bool's</td>
    </tr>
    <tr>
      <td><code>ori8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise or of the two i8's</td>
    </tr>
    <tr>
      <td><code>ori16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise or of the two i16's</td>
    </tr>
    <tr>
      <td><code>ori32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise or of the two i32's</td>
    </tr>
    <tr>
      <td><code>ori64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise or of the two i64's</td>
    </tr>
    <tr>
      <td><code>orbool</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the boolean or of the two bool's</td>
    </tr>
    <tr>
      <td><code>xori8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise xor of the two i8's</td>
    </tr>
    <tr>
      <td><code>xori16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise xor of the two i16's</td>
    </tr>
    <tr>
      <td><code>xori32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise xor of the two i32's</td>
    </tr>
    <tr>
      <td><code>xori64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise xor of the two i64's</td>
    </tr>
    <tr>
      <td><code>xorbool</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the boolean xor of the two bool's</td>
    </tr>
    <tr>
      <td><code>noti8</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the bitwise not of the i8</td>
    </tr>
    <tr>
      <td><code>noti16</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the bitwise not of the i16</td>
    </tr>
    <tr>
      <td><code>noti32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the bitwise not of the i32</td>
    </tr>
    <tr>
      <td><code>noti64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the bitwise not of the i64</td>
    </tr>
    <tr>
      <td><code>notbool</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the boolean not of the bool</td>
    </tr>
    <tr>
      <td><code>nandi8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise nand of the two i8's</td>
    </tr>
    <tr>
      <td><code>nandi16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise nand of the two i16's</td>
    </tr>
    <tr>
      <td><code>nandi32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise nand of the two i32's</td>
    </tr>
    <tr>
      <td><code>nandi64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise nand of the two i64's</td>
    </tr>
    <tr>
      <td><code>nandboo</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the boolean nand of the two bool's</td>
    </tr>
    <tr>
      <td><code>nori8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise nor of the two i8's</td>
    </tr>
    <tr>
      <td><code>nori16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise nor of the two i16's</td>
    </tr>
    <tr>
      <td><code>nori32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise nor of the two i32's</td>
    </tr>
    <tr>
      <td><code>nori64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise nor of the two i64's</td>
    </tr>
    <tr>
      <td><code>norbool</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the boolean nor of the two bool's</td>
    </tr>
    <tr>
      <td><code>xnori8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise xnor of the two i8's</td>
    </tr>
    <tr>
      <td><code>xnori16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise xnor of the two i16's</td>
    </tr>
    <tr>
      <td><code>xnori32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise xnor of the two i32's</td>
    </tr>
    <tr>
      <td><code>xnori64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the bitwise xnor of the two i64's</td>
    </tr>
    <tr>
      <td><code>xnorboo</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the boolean xnor of the two bool's</td>
    </tr>
    <tr>
      <td><code>eqi8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two i8's are equal</td>
    </tr>
    <tr>
      <td><code>eqi16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two i16's are equal</td>
    </tr>
    <tr>
      <td><code>eqi32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two i32's are equal</td>
    </tr>
    <tr>
      <td><code>eqi64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two i64's are equal</td>
    </tr>
    <tr>
      <td><code>eqf32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two f32's are equal</td>
    </tr>
    <tr>
      <td><code>eqf64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two f64's are equal</td>
    </tr>
    <tr>
      <td><code>eqstr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two str's are equal</td>
    </tr>
    <tr>
      <td><code>eqbool</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two bool's are equal</td>
    </tr>
    <tr>
      <td><code>neqi8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two i8's are not equal</td>
    </tr>
    <tr>
      <td><code>neqi16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two i16's are not equal</td>
    </tr>
    <tr>
      <td><code>neqi32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two i32's are not equal</td>
    </tr>
    <tr>
      <td><code>neqi64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two i64's are not equal</td>
    </tr>
    <tr>
      <td><code>neqf32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two f32's are not equal</td>
    </tr>
    <tr>
      <td><code>neqf64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two f64's are not equal</td>
    </tr>
    <tr>
      <td><code>neqstr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two str's are not equal</td>
    </tr>
    <tr>
      <td><code>neqbool</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the two bool's are not equal</td>
    </tr>
    <tr>
      <td><code>lti8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i8 is less than the second</td>
    </tr>
    <tr>
      <td><code>lti16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i16 is less than the second</td>
    </tr>
    <tr>
      <td><code>lti32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i32 is less than the second</td>
    </tr>
    <tr>
      <td><code>lti64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i64 is less than the second</td>
    </tr>
    <tr>
      <td><code>ltf32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first f32 is less than the second</td>
    </tr>
    <tr>
      <td><code>ltf64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first f64 is less than the second</td>
    </tr>
    <tr>
      <td><code>ltstr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first str is less than the second</td>
    </tr>
    <tr>
      <td><code>ltei8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i8 is less than or equal to the second</td>
    </tr>
    <tr>
      <td><code>ltei16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i16 is less than or equal to the second</td>
    </tr>
    <tr>
      <td><code>ltei32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i32 is less than or equal to the second</td>
    </tr>
    <tr>
      <td><code>ltei64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i64 is less than or equal to the second</td>
    </tr>
    <tr>
      <td><code>ltef32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first f32 is less than or equal to the second</td>
    </tr>
    <tr>
      <td><code>ltef64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first f64 is less than or equal to the second</td>
    </tr>
    <tr>
      <td><code>ltestr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first str is less than or equal to the second</td>
    </tr>
    <tr>
      <td><code>gti8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i8 is greater than the second</td>
    </tr>
    <tr>
      <td><code>gti16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i16 is greater than the second</td>
    </tr>
    <tr>
      <td><code>gti32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i32 is greater than the second</td>
    </tr>
    <tr>
      <td><code>gti64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i64 is greater than the second</td>
    </tr>
    <tr>
      <td><code>gtf32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first f32 is greater than the second</td>
    </tr>
    <tr>
      <td><code>gtf64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first f64 is greater than the second</td>
    </tr>
    <tr>
      <td><code>gtstr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first str is greater than the second</td>
    </tr>
    <tr>
      <td><code>gtei8</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i8 is greater than or equal to the second</td>
    </tr>
    <tr>
      <td><code>gtei16</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i16 is greater than or equal to the second</td>
    </tr>
    <tr>
      <td><code>gtei32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i32 is greater than or equal to the second</td>
    </tr>
    <tr>
      <td><code>gtei64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first i64 is greater than or equal to the second</td>
    </tr>
    <tr>
      <td><code>gtef32</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first f32 is greater than or equal to the second</td>
    </tr>
    <tr>
      <td><code>gtef64</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first f64 is greater than or equal to the second</td>
    </tr>
    <tr>
      <td><code>gtestr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the first str is greater than or equal to the second</td>
    </tr>
    <tr>
      <td><code>catstr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Concatenates the first string to the second (non-mutating result in output)</td>
    </tr>
    <tr>
      <td><code>split</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Splits the first string by all occurrences of the second into a new array of strings</td>
    </tr>
    <tr>
      <td><code>repstr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Repeats the string (first arg) by the specified number of occurrences (second arg) in a new string (output arg)</td>
    </tr>
    <tr>
      <td><code>matches</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines if the second arg string, treated as a regular expression, matches the first string</td>
    </tr>
    <tr>
      <td><code>indstr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Determines the index of the second string occurring within the first string and returns it as a Result, or errors</td>
    </tr>
    <tr>
      <td><code>lenstr</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the length of the string</td>
    </tr>
    <tr>
      <td><code>trim</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Removes leading and trailing whitespace from the string</td>
    </tr>
    <tr>
      <td><code>copyfrom</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Treats the first argument as an array, the second argument as an index, and makes a duplicate of the array's nth element and stores it in the output argument (UNSAFE)</td>
    </tr>
    <tr>
      <td><code>copytof</code></td><td>IN</td><td>IN</td><td>IN</td><td>Treats the first argument as an array, the second argument as an index, and the third argument as the address of fixed data and stores that fixed data in the array at the specified index (UNSAFE)</td>
    </tr>
    <tr>
      <td><code>copytov</code></td><td>IN</td><td>IN</td><td>IN</td><td>Treats the first argument as an array, the second argument as an index, and the third argument as the address of an array of data and stores a copy of that second array within the first array at the specified address (UNSAFE)</td>
    </tr>
    <tr>
      <td><code>register</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Treats the first argument as an array, the second argument as an index, and places a pointer to the array's nth element and stores it in the output argument (UNSAFE)</td>
    </tr>
    <tr>
      <td><code>newarr</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Creates a new array of the specified initial size and stores it at the output address</td>
    </tr>
    <tr>
      <td><code>pusharr</code></td><td>IN</td><td>IN</td><td>IN</td><td>Treats the first argument as an array, the second argument as the address of a value, and the third argument as a flag on whether the value is a fixed or array type, and pushes a duplicate of that value into the array</td>
    </tr>
    <tr>
      <td><code>poparr</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Pops the last element off of the specified array and returns it in a Result object, or returns an error if the array is empty</td>
    </tr>
    <tr>
      <td><code>lenarr</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the length of the array</td>
    </tr>
    <tr>
      <td><code>indarrf</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Treats the first argument as an array, the second argument as a fixed value, and returns a result-wrapped index the value is first seen in the array, or an error</td>
    </tr>
    <tr>
      <td><code>indarrv</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Treats the first argument as an array, the second argument as an array value, and returns a result-wrapped index the value is first seen in the array, or an error</td>
    </tr>
    <tr>
      <td><code>join</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Treats the first argument as an array of strings, the second argument as a string, and returns a new string where the string array elements are joined together with the second argument in between</td>
    </tr>
    <tr>
      <td><code>map</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and the second argument as an event ID that a single event handler should be registered to (it will only trigger the first one). It then has that handler mutate the array one element at a time and returns the results as a new array. Done in parallel if the array is large enough.</td>
    </tr>
    <tr>
      <td><code>mapl</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and the second argument as an event ID that a single event handler should be registered to (it will only trigger the first one). It then has that handler mutate the array one element at a time and returns the results as a new array. Done sequentially.</td>
    </tr>
    <tr>
      <td><code>reparr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Treats the first argument as an array and creates a new array made up with n duplicates based on the value of the second argument</td>
    </tr>
    <tr>
      <td><code>each</code></td><td>IN</td><td>EVENT</td><td>NULL</td><td>Treats the first argument as an array and the second argument as an event ID, which it then executes for each element of the array in any order.</td>
    </tr>
    <tr>
      <td><code>eachl</code></td><td>IN</td><td>EVENT</td><td>NULL</td><td>Treats the first argument as an array and the second argument as an event ID, which it then executes for each element sequentially</td>
    </tr>
    <tr>
      <td><code>find</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and the second argument as an event ID, which it then executes in parallel to find the first value that passes the test of the second argument and returns Result-wrapped, or errors. Still returns the first such value in the array, not the first encountered.</td>
    </tr>
    <tr>
      <td><code>findl</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and the second argument as an event ID, which it then executes sequentially to find the first value that passes the test of the second argument and returns Result-wrapped, or errors.</td>
    </tr>
    <tr>
      <td><code>every</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and tests every element with the second argument in parallel, and returns true only if all elements return true.</td>
    </tr>
    <tr>
      <td><code>everyl</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and tests every element with the second argument sequentially, and returns true only if all elements return true.</td>
    </tr>
    <tr>
      <td><code>some</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and tests every element with the second argument in parallel, and returns true if any element return true.</td>
    </tr>
    <tr>
      <td><code>somel</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and tests every element with the second argument sequentially, and returns true if any element return true.</td>
    </tr>
    <tr>
      <td><code>filter</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and test every element with the second argument in parallel, putting the element in the new array if it passes the test</td>
    </tr>
    <tr>
      <td><code>filterl</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and test every element with the second argument sequentially, putting the element in the new array if it passes the test</td>
    </tr>
    <tr>
      <td><code>reducel</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and the second argument as an event ID, which it executes sequentially to combine array elements together (maintaining the same type throughout) and finally returning the combined form</td>
    </tr>
    <tr>
      <td><code>reducep</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as an array and the second argument as an event ID, which it executes in parallel to combine array elements together (maintaining the same type throughout) and finally returning the combined form. Requires the reducer function to be commutative.</td>
    </tr>
    <tr>
      <td><code>foldl</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as a special array that houses the actual array in the first address and the initial value to reduce with in the second address. This allows for the output to store as a new type, with the initial value being of the same type as the output. The second argument has the event ID to perform the reduction with and this is executed sequentially.</td>
    </tr>
    <tr>
      <td><code>foldp</code></td><td>IN</td><td>EVENT</td><td>OUT</td><td>Treats the first argument as a special array that houses the actual array in the first address and the initial value to reduce with in the second address. This allows for the output to store as a new type, with the initial value being of the same type as the output. The second argument has the event ID to perform the reduction with and this is executed in parallel. This means the initial value will be merged in one OR MORE times and therefore the merging operation with that value must be idempotent, and the reducer function must be commutative.</td>
    </tr>
    <tr>
      <td><code>catarr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Creates a new array consisting first of the elements of the first array and second of the elements of the second array.</td>
    </tr>
    <tr>
      <td><code>condfn</code></td><td>IN</td><td>EVENT</td><td>NULL</td><td>Uses the first argument as a boolean to check if the second argument, an event ID, should be executed or not</td>
    </tr>
    <tr>
      <td><code>copyi8</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Copies the i8 to a new address</td>
    </tr>
    <tr>
      <td><code>copyi16</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Copies the i16 to a new address</td>
    </tr>
    <tr>
      <td><code>copyi32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Copies the i32 to a new address</td>
    </tr>
    <tr>
      <td><code>copyi64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Copies the i64 to a new address</td>
    </tr>
    <tr>
      <td><code>copyvoid</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Copies the void to a new address</td>
    </tr>
    <tr>
      <td><code>copyf32</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Copies the f32 to a new address</td>
    </tr>
    <tr>
      <td><code>copyf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Copies the f64 to a new address</td>
    </tr>
    <tr>
      <td><code>copybool</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Copies the bool to a new address</td>
    </tr>
    <tr>
      <td><code>copystr</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Copies the str to a new address</td>
    </tr>
    <tr>
      <td><code>copyarr</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Copies the array to a new address</td>
    </tr>
    <tr>
      <td><code>zeroed</code></td><td>NULL</td><td>NULL</td><td>OUT</td><td>Blanks the specified address</td>
    </tr>
    <tr>
      <td><code>lnf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes a trigonometric ln on the f64</td>
    </tr>
    <tr>
      <td><code>logf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes a trigonometric log on the f64</td>
    </tr>
    <tr>
      <td><code>sinf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes a trigonometric sin on the f64</td>
    </tr>
    <tr>
      <td><code>cosf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes a trigonometric cos on the f64</td>
    </tr>
    <tr>
      <td><code>tanf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes a trigonometric tan on the f64</td>
    </tr>
    <tr>
      <td><code>asinf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes a trigonometric asin on the f64</td>
    </tr>
    <tr>
      <td><code>acosf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes a trigonometric acos on the f64</td>
    </tr>
    <tr>
      <td><code>atanf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes a trigonometric atan on the f64</td>
    </tr>
    <tr>
      <td><code>sinhf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes a trigonometric sinh on the f64</td>
    </tr>
    <tr>
      <td><code>coshf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes a trigonometric cosh on the f64</td>
    </tr>
    <tr>
      <td><code>tanhf64</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes a trigonometric tanh on the f64</td>
    </tr>
    <tr>
      <td><code>error</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Turns the specified error message into an Error type</td>
    </tr>
    <tr>
      <td><code>noerr</code></td><td>NULL</td><td>NULL</td><td>OUT</td><td>Creates an empty non-error Error</td>
    </tr>
    <tr>
      <td><code>errorstr</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Extracts the error message from the Error</td>
    </tr>
    <tr>
      <td><code>someM</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Wraps the provided value in a Maybe type</td>
    </tr>
    <tr>
      <td><code>noneM</code></td><td>NULL</td><td>NULL</td><td>OUT</td><td>Creates an empty Maybe</td>
    </tr>
    <tr>
      <td><code>isSome</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Tests if the Maybe has a value</td>
    </tr>
    <tr>
      <td><code>isNone</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Tests if the Maybe has no value</td>
    </tr>
    <tr>
      <td><code>getOrM</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Extracts the value from the Maybe in the first argument, or returns the default value in the second argument</td>
    </tr>
    <tr>
      <td><code>okR</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Wraps the provided value in a Result type</td>
    </tr>
    <tr>
      <td><code>err</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Wraps the provided error message in a Result type</td>
    </tr>
    <tr>
      <td><code>isOk</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Tests if the Result has a successful value</td>
    </tr>
    <tr>
      <td><code>isErr</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Tests if the Result has an error value</td>
    </tr>
    <tr>
      <td><code>getOrR</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the Result-wrapped value or the default value</td>
    </tr>
    <tr>
      <td><code>getOrRS</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the Result-wrapped string or the default string (workaround for kink involving strings in global memory)</td>
    </tr>
    <tr>
      <td><code>getR</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the Result-wrapped value or crashes the runtime (UNSAFE)</td>
    </tr>
    <tr>
      <td><code>getErr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the Result-wrapped error or a default error value</td>
    </tr>
    <tr>
      <td><code>resfrom</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Looks up the value of the index (second argument of the array (first argument) and returns that value Result-wrapped, or returns a Result-wrapped error</td>
    </tr>
    <tr>
      <td><code>mainE</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Creates an Either-wrapped main value</td>
    </tr>
    <tr>
      <td><code>altE</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Creates an Either-wrapped alternate value</td>
    </tr>
    <tr>
      <td><code>isMain</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Tests if the Etiher is a main value</td>
    </tr>
    <tr>
      <td><code>isAlt</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Tests if the Either is an alternate value</td>
    </tr>
    <tr>
      <td><code>mainOr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the Either-wrapped main value or the default value</td>
    </tr>
    <tr>
      <td><code>altOr</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns the Either-wrapped alt value or the default value</td>
    </tr>
    <tr>
      <td><code>hashf</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the 64-bit hash of the specified fixed value</td>
    </tr>
    <tr>
      <td><code>hashv</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns the 64-bit hash of the specified array value</td>
    </tr>
    <tr>
      <td><code>dssetf</code></td><td>IN</td><td>IN</td><td>IN</td><td>Stores the specified fixed value (third argument) in the namespace (first argument) and key (second argument) pair</td>
    </tr>
    <tr>
      <td><code>dssetv</code></td><td>IN</td><td>IN</td><td>IN</td><td>Stores the specified array value (third argument) in the namespace (first argument) and key (second argument) pair</td>
    </tr>
    <tr>
      <td><code>dshas</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Checks the namespace (first argument) and key (second argument) pair for the presence of a value</td>
    </tr>
    <tr>
      <td><code>dsdel</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Checks the namespace (first argument) and key (second argument) pair for the presence of a value and returns that status. If there was a value it also removes it.</td>
    </tr>
    <tr>
      <td><code>dsgetf</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns a Result-wrapped fixed value (or error) for the specified namespace-key pair</td>
    </tr>
    <tr>
      <td><code>dsgetv</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns a Result-wrapped array value (or error) for the specified namespace-key pair</td>
    </tr>
    <tr>
      <td><code>httpget</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Returns a Result-wrapped string (or error) for the specified URL request</td>
    </tr>
    <tr>
      <td><code>httppost</code></td><td>IN</td><td>IN</td><td>OUT</td><td>Returns a Result-wrapped string (or error) for the specified post URL and body</td>
    </tr>
    <tr>
      <td><code>httplsn</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Starts an HTTP server on the specified port and returns a Result-wrapped 'ok' string or an Error</td>
    </tr>
    <tr>
      <td><code>httpsend</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>For a given connection response payload, send that payload to the client requesting it and returns a Result-wrapped 'ok' string or an Error if it failed</td>
    </tr>
    <tr>
      <td><code>waitop</code></td><td>IN</td><td>NULL</td><td>NULL</td><td>Waits the specified number of milliseconds, then continues execution</td>
    </tr>
    <tr>
      <td><code>execop</code></td><td>IN</td><td>NULL</td><td>OUT</td><td>Executes the specified shell string and returns the exit code and stdout and stderr strings in an array</td>
    </tr>
    <tr>
      <td><code>stdoutp</code></td><td>IN</td><td>NULL</td><td>NULL</td><td>Writes the specified string to standard output</td>
    </tr>
    <tr>
      <td><code>exitop</code></td><td>IN</td><td>NULL</td><td>NULL</td><td>Terminates the process with the specified exit code</td>
    </tr>
  </tbody>
</table>
