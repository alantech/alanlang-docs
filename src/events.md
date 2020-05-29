#### Events

Events are sources for activity in `alan`. No code is run that isn't triggered by an event. Event declaration is relatively simple:

```
event eventName: typename
```

where `eventName` is the name of the event. It is also possible to construct an event with a function if the set of possible events to work with is difficult to describe statically. A function that returns an instance of a realized `Event<E>` type can also be used to emit to or register a handler for. Since event handler registration can only happen in module scope, this is more of a macro-like expansion and the total set of event types in the system is still known statically to the compiler. See the HTTP Server example near the end of this document for more information.

