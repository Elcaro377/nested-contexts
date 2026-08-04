import { createContext, use, type ReactNode, type Context } from "react";

type ContextEntry<T> = [keyof T, Context<T[keyof T]>];

type FromEntries<T extends [PropertyKey, unknown][]> = {
    [K in T[number][0]]: Extract<T[number], [K, unknown]>[1];
};

export function createNestedContexts<T extends object>(initValue: T) {
    const entries = Object.entries(initValue) as [keyof T, T[keyof T]][];
    const contextEntries = entries.map(([k, v]) => [k, createContext(v)] as const);
    const contextDict = Object.fromEntries(contextEntries) as FromEntries<ContextEntry<T>[]>;

    function NestedContexts(
        { values, children }: { values: T, children?: ReactNode }
    ) {
        return contextEntries.reduce(
            (node, [k, Ctx]) => <Ctx value={values[k]}>{node}</Ctx>,
            children,
        );
    };

    function useNestedContexts<const Ks extends readonly (keyof T)[]>(...keys: Ks) {
        return Object.fromEntries(keys.map(k => [k, use(contextDict[k])])) as { [K in Ks[number]]: T[K] };
    }

    return [NestedContexts, useNestedContexts] as const;
}