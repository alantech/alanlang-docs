## More advanced examples

These examples are still relatively simple (they fit in a single file) but they demonstrate more concepts that cannot be easily shown in just a "Hello, World!" application.

### `loop.ln`

```rust,editable
from @std/app import start, print, exit

on start {
  const count = [1, 2, 3, 4, 5];
  const byTwos = count.map(fn (n: int64): int64 = n * 2);
  count.map(toString).join(', ').print();
  byTwos.map(toString).join(', ').print();
  emit exit 0;
}
```

Alan does not allow arbitrary loops or recursion, but you can still loop over data. This example shows the primary way to do iteration in Alan using the functional [array api](./builtins/array_api.md) which can be parallelized by the AVM. However when absolutely necessary, Alan offers a controlled way of [expressing algorithms that are inherently sequential](./std_seq.md).

### `math.ln`

```rust,editable
from @std/app import start, print, exit

on start fn {
  print(concat("1 + 2 = ", toString(1 + 2)));
  print(concat("1 - 2 = ", toString(1 - 2)));
  print(concat("1 * 2 = ", toString(1 * 2)));
  print(concat("1 / 2 = ", toString(1.0 / 2.0)));
  print(concat("1 % 2 = ", toString(1 % 2)));
  print(concat("1 ** 2 = ", toString(1 ** 2)));
  print(concat("1 & 2 = ", toString(1 & 2)));
  print(concat("1 | 2 = ", toString(1 | 2)));
  print(concat("1 ^ 2 = ", toString(1 ^ 2)));
  print(concat("!1 = ", toString(!1)));
  print(concat("1 !& 2 = ", toString(1 !& 2)));
  print(concat("1 !| 2 = ", toString(1 !| 2)));
  print(concat("1 !^ 2 = ", toString(1 !^ 2)));
  print(concat("1 + 2 * 3 ** 4 = ", toString(1 + 2 * 3 ** 4)));

  emit exit 0;
}
```

This example shows multiple math operations and their results, with the last statement demonstrating the order of operations effectively inverting the computational flow of that statement.

### `object_literals.ln`
```rust,editable
from @std/app import start, print, exit

type MyType {
  foo: string,
  bar: bool,
}

on start {
  print("Custom type assignment");
  const test = new MyType {
    foo: "foo!",
    bar: true,
  };
  print(test.foo);
  print(test.bar);

  let test2 = new MyType {
    foo: "foo2",
    bar: true
  };
  test2.bar = false;
  print(test2.foo);
  print(test2.bar);

  print("Array literal assignment");
  const test3 = new Array<int64> [ 1, 2, 4, 8, 16, 32, 64 ];
  print(test3[0]);
  print(test3[1]);
  print(test3[2]);

  let test4 = [ 0, 1, 2, 3 ];
  test4.set(0, 1);
  print(test4[0]);

  print("HashMap literal assignment");
  const test5 = newHashMap(true, 1);
  test5.set(false, 0);

  print(test5.get(true));
  print(test5.get(false));

  let test6 = newHashMap("foo", "bar");
  test6.set("foo", "baz");
  print(test6.get("foo"));

  emit exit 0;
}
```

This example demonstrates the three (so far) object literal syntaxes and sub-value accessor syntaxes.

### `if.ln`
```rust,editable
from @std/app import start, print, exit

fn bar() {
  print("bar!");
}

fn baz() {
  print("baz!");
}

fn nearOrFar(distance: float64): string {
  if distance < 5.0 {
    return "Near!";
  } else {
    return "Far!";
  }
}

on start {
  if 1 == 0 {
    print("What!?");
  } else {
    print("The world is sane...");
  }

  if 1 == 0 {
    print("Not this again...");
  } else if 1 == 2 {
    print("Still wrong...");
  } else {
    print("The world is still sane, for now...");
  }

  const foo: bool = true;
  if foo bar else baz

  print(nearOrFar(3.14));
  print(nearOrFar(6.28));

  const options = pair(2, 4);
  print(options[0]);
  print(options[1]);

  const options2 = 3 : 5;
  print(options2[0]);
  print(options2[1]);

  const val1 = 1 == 1 ? 1 : 2;
  const val2 = 1 == 0 ? 1 : 2;
  print(val1);
  print(val2);

  const val3 = cond(1 == 1, pair(3, 4));
  const val4 = cond(1 == 0, pair(3, 4));
  print(val3);
  print(val4);

  const val5 = 1 == 0 ? options2;
  print(val5);

  emit exit 0;
}
```

This example demonstrates conditionals (if statements) and shows that the conditional "scopes" are actually functions, but due to how nested scope rules work, they can still manipulate the parent function scope as needed for execution to function. It also demonstrates "ternary" operators and how they are composed of `pair` and `cond` function calls.

<!-- TODO: Restore these once we figure out how to do multi-file examples in mdbook and our browser-transpiled compiler
### `datetime.ln`

```rust,editable
from @std/app import print

export type Year {
  year: int32
}

export type YearMonth {
  year: int32,
  month: int8
}

export type Date {
  year: int32,
  month: int8,
  day: int8
}

export type Hour {
  hour: int8
}

export type HourMinute {
  hour: int8,
  minute: int8
}

export type Time {
  hour: int8,
  minute: int8,
  second: float64
}

export type DateTime {
  date: Date,
  time: Time,
  timezone: HourMinute
}

export fn makeYear(year: int32): Year {
  return new Year {
    year: year
  }
}

export fn makeYear(year: int64): Year {
  return new Year {
    year: toInt32(year)
  }
}

export fn makeYearMonth(year: int32, month: int8): YearMonth {
  return new YearMonth {
    year: year,
    month: month
  }
}

export fn makeYearMonth(y: Year, month: int64): YearMonth {
  return new YearMonth {
    year: y.year,
    month: toInt8(month)
  }
}

export fn makeDate(year: int32, month: int8, day: int8): Date {
  return new Date {
    year: year,
    month: month,
    day: day
  }
}

export fn makeDate(ym: YearMonth, day: int64): Date {
  return new Date {
    year: ym.year,
    month: ym.month,
    day: toInt8(day)
  }
}

export fn makeHour(hour: int8): Hour {
  return new Hour {
    hour: hour
  }
}

export fn makeHourMinute(hour: int8, minute: int8): HourMinute {
  return new HourMinute {
    hour: hour,
    minute: minute
  }
}

export fn makeHourMinute(hour: int64, minute: int64): HourMinute {
  return new HourMinute {
    hour: toInt8(hour),
    minute: toInt8(minute)
  }
}

export fn makeHourMinute(h: Hour, minute: int8): HourMinute {
  return new HourMinute {
    hour: h.hour,
    minute: minute
  }
}

export fn makeTime(hour: int8, minute: int8, second: float64): Time {
  return new Time {
    hour: hour,
    minute: minute,
    second: second
  }
}

export fn makeTime(hm: HourMinute, second: float64): Time {
  return new Time {
    hour: hm.hour,
    minute: hm.minute,
    second: second
  }
}

export fn makeTime(hm: HourMinute, second: int64): Time {
  return new Time {
    hour: hm.hour,
    minute: hm.minute,
    second: toFloat64(second)
  }
}

export fn makeDateTime(date: Date, time: Time, timezone: HourMinute): DateTime {
  return new DateTime {
    date: date,
    time: time,
    timezone: timezone
  }
}

export fn makeDateTime(date: Date, time: Time): DateTime {
  return new DateTime {
    date: date,
    time: time
  }
}

export fn makeDateTimeTimezone(dt: DateTime, timezone: HourMinute): DateTime {
  return new DateTime {
    date: dt.date,
    time: dt.time,
    timezone: timezone
  }
}

export fn makeDateTimeTimezoneRev(dt: DateTime, timezone: HourMinute): DateTime {
  return new DateTime {
    date: dt.date,
    time: dt.time,
    timezone: new HourMinute {
      hour: -timezone.hour,
      minute: timezone.minute
    }
  }
}

export fn print(dt: DateTime) {
  // TODO: Work on formatting stuff
  const timezoneOffsetSymbol = dt.timezone.hour < toInt8(0) ? "-" : "+";
  const str: string = concat(
    toString(dt.date.year), "-", toString(dt.date.month), "-", toString(dt.date.day), "@",
    toString(dt.time.hour), ":", toString(dt.time.minute), ":", toString(dt.time.second),
    timezoneOffsetSymbol, abs(dt.timezone.hour).toString(), ":", dt.timezone.minute.toString()
  );
  print(str);
}

export prefix # 2 makeYear

export infix - 2 makeYearMonth

export infix - 2 makeDate

export infix : 3 makeHourMinute

export infix : 3 makeTime

export infix @ 2 makeDateTime

export infix + 2 makeDateTimeTimezone

export infix - 2 makeDateTimeTimezoneRev
```

This more complex example defines a simplistic DateTime type and associated types, as well as various constructor functions and mappings of those onto operators.

### `test_datetime.ln`

```rust,editable
from @std/app import start, exit

from ./datetime import DateTime, print, #, -, :, @, +

on start fn {
  const dt: DateTime = #2020 - 01 - 15@09:45:00 - 08:00;
  print(dt);
  emit exit 0;
}
```

This file uses the `datetime.ln` file to very concisely define a time in ISO format and then print it out. It is a demonstration of how operators can be used to create compact-but-clear DSLs where you can still go to the source code to find out how and why it works.

### `method.ln`

```rust,editable
from @std/app import start, print, exit

from ./datetime import DateTime, print, #, -, :, @, +

on start fn {
  true.print();
  1.print();
  3.14159.print();
  "Hello, World!".print();

  const dt: DateTime = #2020 - 01 - 17@16:15:00 - 08:00;
  dt.print();

  print(3.add(2));
  3.add(2).print();
  (3 + 2).print();

  emit exit 0;
}
```

This example introduces method syntax, and shows multiple variants of the same statement at the end.

-->

### `string.ln`

```rust,editable
from @std/app import start, print, exit

on start fn {
  const helloWorld: string = "Hello, " + "World!";
  print(helloWorld);

  const helloWorldArr: Array<string> = helloWorld / ", ";
  print(helloWorldArr[0]);
  print(helloWorldArr[1]);

  const helloWorldArr2: Array<string> = helloWorld.split(", ");
  print(helloWorldArr2[0]);
  print(helloWorldArr2[1]);

  print("Hi " * 5);
  print(repeat("Hi ", 5));

  print(helloWorld ~ "or");
  print(helloWorld.matches("or"));

  print(helloWorld @ "or");
  helloWorld.index("or").print();

  print(#helloWorld);
  print(length(helloWorld));
  print(helloWorld.length());
  helloWorld.length().print();

  print("'" + `("Hi " * 5) + "'");
  print("'" + trim(repeat("Hi ", 5)) + "'");

  emit exit 0;
}
```

This example exercises many string manipulation mechanisms and alternate syntaxes using operators and method style function calls.

### `box.ln`

```rust,editable
from @std/app import start, print, exit

// Generic types don't need to be capitalized, but it tends to look nicer
type Box<V> {
  set: bool,
  val: V
}

on start fn {
  let int8Box = new Box<int64> {
    val: 8,
    set: true
  };
  print(int8Box.val);
  print(int8Box.set);

  let stringBox = new Box<string> {
    val: "hello, generics!",
    set: true
  };
  print(stringBox.val);
  print(stringBox.set);

  const stringBoxBox = new Box<Box<string>> {
    val: new Box<string> {
      val: "hello, nested generics!",
      set: true
    },
    set: true
  };
  stringBoxBox.set.print();
  stringBoxBox.val.set.print();
  print(stringBoxBox.val.val);

  // The following is a compile time error, uncomment to see!
  // stringBox.val = 8

  emit exit 0;
}
```

This example uses generics to define a Box type and how to work with it at a basic assignment level.

