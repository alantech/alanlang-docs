#### Built-in Operators

As [operators](../operators.md) in Alan are simply aliases for functions with a precedence value associated, all of the following operators have their underlying implementation defined above.

<table>
  <thead>
    <tr>
      <td>Operator</td><td>Infix/Prefix</td><td>Precedence</td><td>Function</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>?</code></td><td>infix</td><td>0</td><td><a href="./terniary.md">cond</a></td>
    </tr>
    <tr>
      <td><code>==</code></td><td>infix</td><td>1</td><td><a href="./comparators.md">eq</a></td>
    </tr>
    <tr>
      <td><code>!=</code></td><td>infix</td><td>1</td><td><a href="./comparators.md">neq</a></td>
    </tr>
    <tr>
      <td><code><</code></td><td>infix</td><td>1</td><td><a href="./comparators.md">lt</a></td>
    </tr>
    <tr>
      <td><code><=</code></td><td>infix</td><td>1</td><td><a href="./comparators.md">lte</a></td>
    </tr>
    <tr>
      <td><code>></code></td><td>infix</td><td>1</td><td><a href="./comparators.md">gt</a></td>
    </tr>
    <tr>
      <td><code>>=</code></td><td>infix</td><td>1</td><td><a href="./comparators.md">gte</a></td>
    </tr>
    <tr>
      <td><code>~</code></td><td>infix</td><td>1</td><td><a href="./string_api.md">matches</a></td>
    </tr>
    <tr>
      <td><code>+</code></td><td>infix</td><td>2</td><td><a href="./string_api.md">concat</a></td>
    </tr>
    <tr>
      <td><code>@</code></td><td>infix</td><td>1</td><td><a href="./array_api.md">index</a></td>
    </tr>
    <tr>
      <td><code>-</code></td><td>prefix</td><td>1</td><td><a href="./arithmetic.md">negate</a></td>
    </tr>
    <tr>
      <td><code>+</code></td><td>infix</td><td>2</td><td><a href="./arithmetic.md">add</a></td>
    </tr>
    <tr>
      <td><code>-</code></td><td>infix</td><td>2</td><td><a href="./arithmetic.md">sub</a></td>
    </tr>
    <tr>
      <td><code>*</code></td><td>infix</td><td>3</td><td><a href="./arithmetic.md">mul</a></td>
    </tr>
    <tr>
      <td><code>/</code></td><td>infix</td><td>3</td><td><a href="./arithmetic.md">div</a></td>
    </tr>
    <tr>
      <td><code>%</code></td><td>infix</td><td>3</td><td><a href="./arithmetic.md">mod</a></td>
    </tr>
    <tr>
      <td><code>**</code></td><td>infix</td><td>4</td><td><a href="./arithmetic.md">pow</a></td>
    </tr>
    <tr>
      <td><code>|</code></td><td>infix</td><td>2</td><td><a href="./bitwise.md">or</a></td>
    </tr>
    <tr>
      <td><code>||</code></td><td>infix</td><td>2</td><td><a href="./bitwise.md">or</a></td>
    </tr>
    <tr>
      <td><code>^</code></td><td>infix</td><td>2</td><td><a href="./bitwise.md">xor</a></td>
    </tr>
    <tr>
      <td><code>!|</code></td><td>infix</td><td>2</td><td><a href="./bitwise.md">nor</a></td>
    </tr>
    <tr>
      <td><code>!^</code></td><td>infix</td><td>2</td><td><a href="./bitwise.md">xnor</a></td>
    </tr>
    <tr>
      <td><code>|</code></td><td>infix</td><td>2</td><td><a href="./result_maybe.md">getOr</a></td>
    </tr>
    <tr>
      <td><code>||</code></td><td>infix</td><td>2</td><td><a href="./result_maybe.md">getOr</a></td>
    </tr>
    <tr>
      <td><code>*</code></td><td>infix</td><td>3</td><td><a href="./array_api.md">repeat</a></td>
    </tr>
    <tr>
      <td><code>/</code></td><td>infix</td><td>3</td><td><a href="./string_api.md">repeat</a></td>
    </tr>
    <tr>
      <td><code>%</code></td><td>infix</td><td>3</td><td><a href="./string_api.md">template</a></td>
    </tr>
    <tr>
      <td><code>&</code></td><td>infix</td><td>3</td><td><a href="./bitwise.md">and</a></td>
    </tr>
    <tr>
      <td><code>&&</code></td><td>infix</td><td>3</td><td><a href="./bitwise.md">and</a></td>
    </tr>
    <tr>
      <td><code>!&</code></td><td>infix</td><td>3</td><td><a href="./bitwise.md">nand</a></td>
    </tr>
    <tr>
      <td><code>!</code></td><td>prefix</td><td>4</td><td><a href="./bitwise.md">not</a></td>
    </tr>
    <tr>
      <td><code>#</code></td><td>prefix</td><td>4</td><td><a href="./string_api.md">length</a></td>
    </tr>
    <tr>
      <td><code>`</code></td><td>prefix</td><td>4</td><td><a href="./string_api.md">trim</a></td>
    </tr>
    <tr>
      <td><code>:</code></td><td>infix</td><td>5</td><td><a href="./terniary.md">pair</a></td>
    </tr>
    <tr>
      <td><code>:</code></td><td>infix</td><td>6</td><td><a href="./array_api.md">push</a></td>
    </tr>
  </tbody>
</table>