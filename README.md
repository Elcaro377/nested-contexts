English | [简体中文](README.zh-CN.md)

# nested-contexts

[![npm version](https://img.shields.io/npm/v/nested-contexts.svg)](https://www.npmjs.com/package/nested-contexts)
[![License](https://img.shields.io/npm/l/nested-contexts.svg)](https://github.com/Elcaro377/nested-contexts/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/nested-contexts)](https://bundlephobia.com/package/nested-contexts)

A minimal, lightweight React utility: achieve **precise subscriptions** via nested Contexts, avoiding re-renders of components that subscribe to unrelated fields.

> Requires **React >= 19**: it internally uses the `use` Hook introduced in React 19 to read Context values.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Limitations and Caveats](#limitations-and-caveats)
- [License](#license)

## Introduction

`nested-contexts` provides a `createNestedContexts` function that splits a data object into multiple independent Contexts, returning a `NestedContexts` Provider and a `useNestedContexts` Hook.
Consumer components subscribe to fields on demand through the Hook: when a field updates, **only components subscribed to that field re-render**.

## Installation

```bash
npm install nested-contexts
```

You also need to install the peer dependency yourself:

```bash
npm install react@>=19
```

## Usage

### Basic Usage

> Note: consumer components need a stable reference (e.g., by wrapping them with `React.memo`), otherwise they may still re-render due to the parent component.

```tsx
import { memo, useState } from 'react';
import { createNestedContexts } from 'nested-contexts';

const [CounterContexts, useCounterContexts] = createNestedContexts({
    a: 0,
    b: 0,
});

// Only subscribes to a
const ConsumerA = memo(() => {
    const { a } = useCounterContexts('a');
    return <div>a: {a}</div>;
});

// Only subscribes to b
const ConsumerB = memo(() => {
    const { b } = useCounterContexts('b');
    return <div>b: {b}</div>;
});

export function App() {
    const [values, setValues] = useState({ a: 0, b: 0 });

    const incrementA = () => setValues(({ a, b }) => ({ a: a + 1, b }));
    const incrementB = () => setValues(({ a, b }) => ({ a, b: b + 1 }));

    return (
        <CounterContexts values={values}>
            <button type="button" onClick={incrementA}>a += 1 (only causes ConsumerA to re-render)</button>
            <button type="button" onClick={incrementB}>b += 1 (only causes ConsumerB to re-render)</button>
            <ConsumerA />
            <ConsumerB />
        </CounterContexts>
    );
}
```

When `a` or `b` changes, only the corresponding `Consumer` re-renders.

## API

### `createNestedContexts(initValue)`

```ts
function createNestedContexts<T extends Record<string, unknown>>(initValue: T): [
    NestedContexts,
    useNestedContexts,
];
```

Creates an independent React Context for each key of the passed object based on `initValue`, returning a tuple `[NestedContexts, useNestedContexts]`:

**Parameters**

- **`initValue`**: the initial value object. Its key-value pairs determine which fields the contexts contain and their respective default values.

**Returns**

- The context Provider component and the Hook used to subscribe to fields on demand.

**Example**

```tsx
const [UserContexts, useUserContexts] = createNestedContexts({
    id: 0,
    username: '',
    password: '',
});
```

#### `NestedContexts` (Context Provider component)

```ts
type NestedContexts = (props: { values: T; children?: ReactNode }) => ReactNode;
```

The context Provider component, used in the same way as the native `React.Context.Provider`.

**Parameters**

- **`values`**: the complete data object, providing the current value for each field.
- **`children`**: child nodes.

**Returns**

- The context Provider component.

**Example**

```tsx
function App() {
    const [userForm, setUserForm] = useState({ 
        id: 0,
        username: '', 
        password: '' 
    });

    return (
        {/* ... */}
        <UserContexts values={userForm}>
            {/* ... */}
                <UserInfo />
            {/* ... */}
        </UserContexts>
    );
}
```

#### `useNestedContexts(...keys)` (Subscription Hook)

```ts
type useNestedContexts = <const Ks extends readonly (keyof T)[]>(
    ...keys: Ks
) => { [K in Ks[number]]: T[K] };
```

The Hook used in consumer components to subscribe to fields on demand.

**Parameters**

- Variadic: pass the list of fields you want to subscribe to.

**Returns**

- A precisely typed object containing only the subscribed fields.

**Example**

```tsx
function UserInfo() {
    const { id, username } = useUserContexts('id', 'username');
    return <>
        <div>ID: {id}</div>
        <div>Username: {username}</div>
    </>;
}
```

## Limitations and Caveats

- **Child components need stable references**: a parent re-render can make child references unstable and trigger their re-renders, so consumer components should be wrapped with `React.memo` (or use React Compiler to do this automatically) to stabilize references; otherwise they may still re-render because of the parent.

- **Not recommended when there are many fields**: this library creates an independent React Context for each field; the more fields, the higher the render and memory cost. This library is designed to quickly achieve precise subscriptions in a minimal way when **there are few fields**; when there are many fields or the state structure is complex, consider a state library like [zustand](https://github.com/pmndrs/zustand) for better performance.

## License

[MIT](./LICENSE) © Elcaro377