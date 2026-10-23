import { Flags } from "@oclif/core";

/** A flag that takes any number, decimals and negatives included. */
export const numberFlag = Flags.custom<number>({
  parse: async (input) => {
    const value = Number(input);
    if (input.trim() === "" || Number.isNaN(value))
      throw new Error(`Expected a number but received: ${input}`);
    return value;
  },
});
