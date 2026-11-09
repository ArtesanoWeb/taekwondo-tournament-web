"use client";

import type { ComponentProps } from "react";

/**
 * Number field that only accepts digits: typing or pasting "-", "." or "," is refused.
 * It refuses the insertion instead of cleaning the value, so a value already saved with decimals
 * (an athlete weighing 38.5 kg) isn't silently turned into 385 when edited.
 */
export function DigitsInput(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      inputMode="numeric"
      onBeforeInput={(event) => {
        if (/\D/.test(event.data)) event.preventDefault();
      }}
    />
  );
}
