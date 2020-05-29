### @std/json*

This would include an interface, perhaps called `JSONish` that declares all JSON-ish types are those with `fn toJSON(JSONish): string` and `fn fromJSON(string): JSONish` as the required functions. Objects would be `Map<string, JSONish>`, Arrays would be `Array<JSONish>`. `int8`, `int16`, `int32`, and `float32`, `float64` would be the allowed JSON-ish numeric types. `bool` the allowed JSON-ish boolean type, `string` the allowed JSON-ish string type, and `void` the JSON-ish null type.

Other types *could* be added by the user, but because `fromJSON` would likely never reconstruct them, it would be a one-way conversion (eg, converting a `DateTime` object into JSON could become an object with the relevant fields or a unix timestamp or etc, but there's no way for `fromJSON` to know that particular field should be anything other than a `Map` or `int32`).

