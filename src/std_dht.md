### @std/dht*

Just the distributed hash table piece that can be used as the primitive for the underlying distributed database work.

```
type DHT<Val> {
  // special hidden behavior
}
```

`fn has(string): bool`

`fn set(string, Val)`

`fn get(string): Val`

`fn delete(string)`

`fn getAndSet(string, fn (Val): Val)`

I believe these 5 functions are the primitives needed for this, but it may change once theory hits reality.

