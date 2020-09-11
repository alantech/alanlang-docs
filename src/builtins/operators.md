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
      <td><code>?</code></td><td>infix</td><td>0</td><td><a href="./ternary.md#cond">cond</a></td>
    </tr>
    <tr>
      <td><code>==</code></td><td>infix</td><td>1</td><td><a href="./comparators.md#eq">eq</a></td>
    </tr>
    <tr>
      <td><code>!=</code></td><td>infix</td><td>1</td><td><a href="./comparators.md#neq">neq</a></td>
    </tr>
    <tr>
      <td><code><</code></td><td>infix</td><td>1</td><td><a href="./comparators.md#lt">lt</a></td>
    </tr>
    <tr>
      <td><code><=</code></td><td>infix</td><td>1</td><td><a href="./comparators.md#lte">lte</a></td>
    </tr>
    <tr>
      <td><code>></code></td><td>infix</td><td>1</td><td><a href="./comparators.md#gt">gt</a></td>
    </tr>
    <tr>
      <td><code>>=</code></td><td>infix</td><td>1</td><td><a href="./comparators.md#gte">gte</a></td>
    </tr>
    <tr>
      <td><code>~</code></td><td>infix</td><td>1</td><td><a href="./string_api.md#matches">matches</a></td>
    </tr>
    <tr>
      <td><code>+</code></td><td>infix</td><td>2</td><td><a href="./string_api.md#concat">concat</a></td>
    </tr>
    <tr>
      <td><code>@</code></td><td>infix</td><td>1</td><td><a href="./array_api.md#index">index</a></td>
    </tr>
    <tr>
      <td><code>-</code></td><td>prefix</td><td>1</td><td><a href="./arithmetic.md#negate">negate</a></td>
    </tr>
    <tr>
      <td><code>+</code></td><td>infix</td><td>2</td><td><a href="./arithmetic.md#add">add</a></td>
    </tr>
    <tr>
      <td><code>-</code></td><td>infix</td><td>2</td><td><a href="./arithmetic.md#sub">sub</a></td>
    </tr>
    <tr>
      <td><code>*</code></td><td>infix</td><td>3</td><td><a href="./arithmetic.md#mul">mul</a></td>
    </tr>
    <tr>
      <td><code>/</code></td><td>infix</td><td>3</td><td><a href="./arithmetic.md#div">div</a></td>
    </tr>
    <tr>
      <td><code>%</code></td><td>infix</td><td>3</td><td><a href="./arithmetic.md#mod">mod</a></td>
    </tr>
    <tr>
      <td><code>**</code></td><td>infix</td><td>4</td><td><a href="./arithmetic.md#pow">pow</a></td>
    </tr>
    <tr>
      <td><code>|</code></td><td>infix</td><td>2</td><td><a href="./bitwise.md#or">or</a></td>
    </tr>
    <tr>
      <td><code>||</code></td><td>infix</td><td>2</td><td><a href="./bitwise.md#or">or</a></td>
    </tr>
    <tr>
      <td><code>^</code></td><td>infix</td><td>2</td><td><a href="./bitwise.md#xor">xor</a></td>
    </tr>
    <tr>
      <td><code>!|</code></td><td>infix</td><td>2</td><td><a href="./bitwise.md#nor">nor</a></td>
    </tr>
    <tr>
      <td><code>!^</code></td><td>infix</td><td>2</td><td><a href="./bitwise.md#xnor">xnor</a></td>
    </tr>
    <tr>
      <td><code>|</code></td><td>infix</td><td>2</td><td><a href="./result_maybe.md#getOr">getOr</a></td>
    </tr>
    <tr>
      <td><code>||</code></td><td>infix</td><td>2</td><td><a href="./result_maybe.md#getOr">getOr</a></td>
    </tr>
    <tr>
      <td><code>*</code></td><td>infix</td><td>3</td><td><a href="./array_api.md#repeat">repeat</a></td>
    </tr>
    <tr>
      <td><code>/</code></td><td>infix</td><td>3</td><td><a href="./string_api.md#repeat">repeat</a></td>
    </tr>
    <tr>
      <td><code>%</code></td><td>infix</td><td>3</td><td><a href="./string_api.md#template">template</a></td>
    </tr>
    <tr>
      <td><code>&</code></td><td>infix</td><td>3</td><td><a href="./bitwise.md#and">and</a></td>
    </tr>
    <tr>
      <td><code>&&</code></td><td>infix</td><td>3</td><td><a href="./bitwise.md#and">and</a></td>
    </tr>
    <tr>
      <td><code>!&</code></td><td>infix</td><td>3</td><td><a href="./bitwise.md#nand">nand</a></td>
    </tr>
    <tr>
      <td><code>!</code></td><td>prefix</td><td>4</td><td><a href="./bitwise.md#not">not</a></td>
    </tr>
    <tr>
      <td><code>#</code></td><td>prefix</td><td>4</td><td><a href="./string_api.md#length">length</a></td>
    </tr>
    <tr>
      <td><code>`</code></td><td>prefix</td><td>4</td><td><a href="./string_api.md#trim">trim</a></td>
    </tr>
    <tr>
      <td><code>:</code></td><td>infix</td><td>5</td><td><a href="./ternary.md#pair">pair</a></td>
    </tr>
    <tr>
      <td><code>:</code></td><td>infix</td><td>6</td><td><a href="./array_api.md#push">push</a></td>
    </tr>
  </tbody>
</table>