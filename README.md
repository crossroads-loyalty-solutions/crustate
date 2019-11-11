![Crustate](https://gist.githubusercontent.com/Poggen/1070c7fd85addacdd928ddcadd095270/raw/63d803896d36e3e2dd3081ccd8ce1d8a94c75038/crustate.svg?sanitize=true "Crustate")
<p align="center">A message-based modular state-management library for JavaScript applications</p>


[![npm bundle size](https://img.shields.io/bundlephobia/minzip/crustate.svg)](https://bundlephobia.com/result?p=crustate)
[![Dependencies](https://img.shields.io/david/crossroads-loyalty-solutions/crustate.svg)](https://www.npmjs.com/package/crustate)
[![Build Status](https://travis-ci.org/crossroads-loyalty-solutions/crustate.svg?branch=master)](https://travis-ci.org/crossroads-loyalty-solutions/crustate)
[![Codecov](https://img.shields.io/codecov/c/gh/crossroads-loyalty-solutions/crustate.svg)](https://codecov.io/gh/crossroads-loyalty-solutions/crustate)
![License](https://img.shields.io/npm/l/crustate.svg)
[![npm](https://img.shields.io/npm/v/crustate.svg)](https://www.npmjs.com/package/crustate)
[![Greenkeeper badge](https://badges.greenkeeper.io/crossroads-loyalty-solutions/crustate.svg)](https://greenkeeper.io/)

This library is based on the principles of message passing found in languages
like Elm and Elixir/Erlang. The purpose is to be able to build modular state
with controlled side-effects through messaging.

## Model

```javascript
type Model<T, I, M: Message> = {
  id: string,
  init: (init: I) => Update<T>,
  update: (state: T, msg: M) => ?Update<T>,
  subscribe: (state: T) => SubscriptionMap<M>,
};
```

A model represents how a state is initialized and updated, as well as which
messages it will respond to at any given moment.

### Message

```javascript
type Message = { +tag: string };
```

A message is just plain data, a JavaScript object, with a mandatory property
named `tag`. The `tag` is supposed to work as a discriminator, informing the
receivers of what type of message it is, what possible data it contains, and
what it means.

Note that these messages are to be completely serializable by `JSON.stringify`
to facilitate resumable sever-rendering, logging, history playback, inspection,
and other features.

```javascript
const ADD = "add";

let msg = {
  tag: ADD,
  value: 2,
};
```

### Init

```javascript
type ModelInit<T, I> = (init: I) => Update<T>;
```

The initial data of the state, accepts an optional init-parameter.

```javascript
import { updateData } from "crustate";

function init() {
  return updateData(0);
}
```

### Update

```javascript
type ModelUpdate<T, M: Message> = (state: T, msg: M) => ?Update<T>;
```

Conceptually `update` is responsible for receiving messages, interpreting
them, updating the state, and send new messages in case other components need
to be informed or additional data requested.

This is very similar to Redux's Reducer concept with the main difference
being that the `update`-function can send new messages.

```javascript
function update(state, message) {
  switch(message.tag) {
  case ADD:
    return updateData(state + message.value);
  }
}
```

Messages sent from the update function are propagated upwards in the
state-hierarchy and can be subscribed to in supervising states.

### Subscriber

```javascript
type ModelSubscribe<T, M: Message> = (state: T) => Subscriptions;
type Subscriptions<M: Message> = { [tag: $PropertyType<M, "tag">]: Subscription };
type Subscription<M: Message> = true | { passive?: boolean, matching?: (msg: M) => bool };
```

For a state to actually receive messages it first needs to subscribe to
messages; which tags it is interested in, if they have any specific
requirements, and if it is supposed to be the primary (active) handler for
messages of that type.

```javascript
function subscribe(state) {
  return {
    [ADD]: true,
  };
}
```

By default subscriptions are active but can be turned into passive subscriptions
by specifying the `passive` flag where they will receive all matching messages
even if they already have been received by other child-states, `passive` will
also not prevent any non-`passive` parent states from matching it.
