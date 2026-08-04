import { createContext, use, type ReactNode, type Context } from "react";

export function createNestedContexts<T extends Record<string, unknown>>(initValue: T) {
    const entries = Object.entries(initValue) as [keyof T, T[keyof T]][];
    const contextEntries = entries.map(([k, v]) => [k, createContext(v)] as const);
    const contextRecord = Object.fromEntries(contextEntries) as Record<keyof T, Context<T[keyof T]>>;

    function NestedContexts(
        { values, children }: { values: T, children?: ReactNode }
    ) {
        return contextEntries.reduce(
            (node, [k, Ctx]) => <Ctx value={values[k]}>{node}</Ctx>,
            children,
        );
    };

    function useNestedContexts<const Ks extends readonly (keyof T)[]>(...keys: Ks) {
        return Object.fromEntries(keys.map(k => [k, use(contextRecord[k])])) as { [K in Ks[number]]: T[K] };
    }

    return [NestedContexts, useNestedContexts] as const;
}