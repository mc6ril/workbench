import { routing } from "./routing";

export type Locale = (typeof routing.locales)[number];

export type TranslationValues = Record<string, string | number | Date>;

type BivariantCallback<Args extends unknown[], Result> = {
  bivarianceHack(...args: Args): Result;
}["bivarianceHack"];

export type TranslationFunction = BivariantCallback<
  [key: string, params?: TranslationValues],
  string
>;
