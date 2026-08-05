[English](README.md) | 简体中文

# nested-contexts

[![npm version](https://img.shields.io/npm/v/nested-contexts.svg)](https://www.npmjs.com/package/nested-contexts)
[![License](https://img.shields.io/npm/l/nested-contexts.svg)](https://github.com/Elcaro377/nested-contexts/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/nested-contexts)](https://bundlephobia.com/package/nested-contexts)

极简轻量 React 工具库：通过嵌套 Context 实现**精确订阅**，避免订阅无关字段的组件重渲染。

> 需要 **React >= 19**：内部使用 React 19 新增的 `use` Hook 来读取 Context 值。

## 目录

- [简介](#简介)
- [安装](#安装)
- [使用](#使用)
- [API](#api)
- [局限性与注意事项](#局限性与注意事项)
- [许可证](#许可证)

## 简介

`nested-contexts` 提供 `createNestedContexts` 函数，将数据对象拆分为多个独立的 Context，并返回 `NestedContexts` Provider 与 `useNestedContexts` Hook。
消费组件通过 Hook 按需订阅字段，当某字段更新时，**只有订阅了该字段的组件才会重渲染**。

## 安装

```bash
npm install nested-contexts
```

需要自行安装 peer dependency：

```bash
npm install react@>=19
```

## 使用

### 基本用法

> 注意：消费组件需要稳定引用，（用 `React.memo` 包裹组件等方式），否则仍会因父组件引发重渲染。

```tsx
import { memo, useState } from 'react';
import { createNestedContexts } from 'nested-contexts';

const [CounterContexts, useCounterContexts] = createNestedContexts({
    a: 0,
    b: 0,
});

// 只订阅 a
const ConsumerA = memo(() => {
    const { a } = useCounterContexts('a');
    return <div>a: {a}</div>;
});

// 只订阅 b
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
            <button type="button" onClick={incrementA}>a += 1（只导致 ConsumerA 组件重渲染）</button>
            <button type="button" onClick={incrementB}>b += 1（只导致 ConsumerB 组件重渲染）</button>
            <ConsumerA />
            <ConsumerB />
        </CounterContexts>
    );
}
```

当 `a`、`b` 变化时，只有对应的 `Consumer` 会重渲染。

## API

### `createNestedContexts(initValue)`

```ts
function createNestedContexts<T extends Record<string, unknown>>(initValue: T): [
    NestedContexts,
    useNestedContexts,
];
```

根据 `initValue` 为传入对象的每个键创建一个独立的 React Context，返回一个元组 `[NestedContexts, useNestedContexts]`：

**参数**

- **`initValue`**：初始值对象。它的键值对决定了上下文包含哪些字段以及各自的默认值。

**返回值**

- 上下文的提供组件与用于按需订阅字段的 Hook。

**示例**

```tsx
const [UserContexts, useUserContexts] = createNestedContexts({
    id: 0,
    username: '',
    password: '',
});
```

#### `NestedContexts`（Context Provider 组件）

```ts
type NestedContexts = (props: { values: T; children?: ReactNode }) => ReactNode;
```

上下文的提供组件，使用方式与原生 `React.Context.Provider` 相同。

**参数**

- **`values`**：完整的数据对象，为每个字段提供当前值。
- **`children`**：子节点。

**返回值**

- 上下文的提供组件

**示例**

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

#### `useNestedContexts(...keys)`（订阅 Hook）

```ts
type useNestedContexts = <const Ks extends readonly (keyof T)[]>(
    ...keys: Ks
) => { [K in Ks[number]]: T[K] };
```

消费组件中用于按需订阅字段的 Hook。

**参数**

- 变长参数，传入要订阅的字段列表。

**返回值**

- 一个类型精确的对象，只包含订阅的字段。

**示例**

```tsx
function UserInfo() {
    const { id, username } = useUserContexts('id', 'username');
    return <>
        <div>ID：{id}</div>
        <div>用户名：{username}</div>
    </>;
}
```

## 局限性与注意事项

- **子组件需稳定引用**：父组件重渲染可能会使子组件引用不稳定进而使其重渲染，因此消费组件需要用 `React.memo` 包裹（或启用 React Compiler 以自动完成该过程）等方式稳定引用，否则仍可能会因父组件引发重渲染。

- **字段较多时不建议使用**：本库为每个字段创建一个独立的 React Context，字段越多渲染与内存开销越大。本库旨在**字段较少**时以极简方式快速实现精确订阅；当字段较多、状态结构复杂时，建议改用 [zustand](https://github.com/pmndrs/zustand) 等状态库以获得更好的性能表现。

## 许可证

[MIT](./LICENSE) © Elcaro377
