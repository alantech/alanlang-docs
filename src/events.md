#### Events

Events are sources for activity in Alan. No code is run that isn't triggered by an event. Event declaration is relatively simple:

```rust,ignore
event eventName: typename
```

where `eventName` is the name of the event. The `typename` annotation for events is required, unlike other places within the codebase. This requirement may change in the future as the event handler(s) listening to the event, and/or the event emit statement(s) emitting to the event could determine the type of the event, but it would impact the clarity of code surrounding the event as well as make the parser more complex.
