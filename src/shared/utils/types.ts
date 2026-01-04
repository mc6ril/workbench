/**
 * Common TypeScript utility types for reducing code duplication and improving type safety.
 * Provides reusable type transformations and helpers for common patterns.
 */

/**
 * Common Utility Types
 */

/**
 * Makes a type nullable.
 * @template T The type to make nullable
 * @example
 * type MaybeString = Nullable<string>; // string | null
 */
export type Nullable<T> = T | null;

/**
 * Makes a type optional.
 * @template T The type to make optional
 * @example
 * type MaybeString = Optional<string>; // string | undefined
 */
export type Optional<T> = T | undefined;

/**
 * Recursively makes all properties of a type optional.
 * @template T The type to make deeply partial
 * @example
 * type DeepPartialUser = DeepPartial<{ name: string; address: { city: string } }>;
 * // { name?: string; address?: { city?: string } }
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Recursively makes all properties of a type required.
 * @template T The type to make deeply required
 * @example
 * type DeepRequiredUser = DeepRequired<{ name?: string; address?: { city?: string } }>;
 * // { name: string; address: { city: string } }
 */
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>;
    }
  : T;

/**
 * Gets the keys of type T that have value type U.
 * @template T The object type
 * @template U The value type to filter by
 * @example
 * type StringKeys = KeysOfType<{ a: string; b: number; c: string }, string>; // "a" | "c"
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Picks properties of type T that have value type U.
 * @template T The object type
 * @template U The value type to pick
 * @example
 * type StringProps = PickByType<{ a: string; b: number; c: string }, string>;
 * // { a: string; c: string }
 */
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

/**
 * Omits properties of type T that have value type U.
 * @template T The object type
 * @template U The value type to omit
 * @example
 * type NonStringProps = OmitByType<{ a: string; b: number; c: string }, string>;
 * // { b: number }
 */
export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>;

/**
 * Array Utility Types
 */

/**
 * Extracts the element type from an array type.
 * Works with array literals, Array<T>, and readonly arrays.
 * @template T The array type
 * @example
 * type Element = ArrayElement<string[]>; // string
 * type Element2 = ArrayElement<Array<number>>; // number
 * type Element3 = ArrayElement<readonly boolean[]>; // boolean
 */
export type ArrayElement<T> = T extends readonly (infer U)[]
  ? U
  : T extends (infer U)[]
    ? U
    : never;

/**
 * Array type with at least one element.
 * @template T The element type
 * @example
 * type NonEmpty = NonEmptyArray<string>; // [string, ...string[]]
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Readonly array type alias.
 * Note: TypeScript prefers `readonly T[]` syntax, but this alias is provided for consistency.
 * @template T The element type
 * @example
 * type ReadOnly = ReadonlyArray<string>; // readonly string[]
 */
export type ReadonlyArray<T> = readonly T[];

/**
 * Object Utility Types
 */

/**
 * Extracts the keys of a type as a union type.
 * @template T The object type
 * @example
 * type Keys = Keys<{ a: string; b: number }>; // "a" | "b"
 */
export type Keys<T> = keyof T;

/**
 * Extracts the values of a type as a union type.
 * @template T The object type
 * @example
 * type Values = Values<{ a: string; b: number }>; // string | number
 */
export type Values<T> = T[keyof T];

/**
 * Extracts entries as a tuple type.
 * @template T The object type
 * @example
 * type Entries = Entries<{ a: string; b: number }>;
 * // ["a" | "b", string | number][]
 */
export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

/**
 * Extracts the required keys of a type.
 * @template T The object type
 * @example
 * type Required = RequiredKeys<{ a: string; b?: number }>; // "a"
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends { [P in K]: T[K] }
    ? never
    : K;
}[keyof T];

/**
 * Extracts the optional keys of a type.
 * @template T The object type
 * @example
 * type Optional = OptionalKeys<{ a: string; b?: number }>; // "b"
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends { [P in K]: T[K] }
    ? K
    : never;
}[keyof T];

/**
 * Function Utility Types
 */

/**
 * Extracts the parameters of a function type as a tuple.
 * Note: TypeScript provides a built-in Parameters utility type globally,
 * but this implementation is provided for consistency and documentation.
 * @template T The function type
 * @example
 * type Params = Parameters<(a: string, b: number) => void>; // [string, number]
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is required for utility types to accept any function type
export type Parameters<T extends (...args: any[]) => any> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is required for utility types to accept any function type
  T extends (...args: infer P) => any ? P : never;

/**
 * Extracts the return type of a function type.
 * Note: TypeScript provides a built-in ReturnType utility type globally,
 * but this implementation is provided for consistency and documentation.
 * @template T The function type
 * @example
 * type Return = ReturnType<() => string>; // string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is required for utility types to accept any function type
export type ReturnType<T extends (...args: any[]) => any> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is required for utility types to accept any function type
  T extends (...args: any[]) => infer R ? R : never;

/**
 * Extracts the return type of an async function or Promise type.
 * Unwraps the Promise to get the actual return type.
 * @template T The async function or Promise type
 * @example
 * type AsyncReturn = AsyncReturnType<(a: string) => Promise<string>>; // string
 * type PromiseReturn = AsyncReturnType<Promise<number>>; // number
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is required for utility types to accept any function type
export type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer U>
  ? U
  : T extends Promise<infer U>
    ? U
    : never;

