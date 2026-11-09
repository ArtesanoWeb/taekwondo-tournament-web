"use client";

import { type ComponentProps, useRef } from "react";

const countNonDigits = (text: string) => text.replace(/\d/g, "").length;

/**
 * Number field that only accepts digits: typing or pasting "-", "." or "," is undone.
 *
 * It checks the value after each change because phone keyboards write through composition, which
 * `beforeinput` can't cancel and which overwrites any value set while it's running: that case
 * waits for the composition to end. It rejects new non-digits instead of stripping them all, so a
 * value already saved with decimals (an athlete weighing 38.5 kg) can't silently become 385.
 */
export function DigitsInput(props: ComponentProps<"input">) {
  const accepted = useRef(String(props.defaultValue ?? ""));

  const check = (input: HTMLInputElement) => {
    if (countNonDigits(input.value) <= countNonDigits(accepted.current)) {
      accepted.current = input.value;
      return;
    }
    const caret =
      (input.selectionStart ?? input.value.length) -
      (input.value.length - accepted.current.length);
    input.value = accepted.current;
    input.setSelectionRange(caret, caret);
  };

  return (
    <input
      {...props}
      inputMode="numeric"
      onInput={(event) => {
        if (!(event.nativeEvent as InputEvent).isComposing) {
          check(event.currentTarget);
        }
      }}
      onCompositionEnd={(event) => {
        const input = event.currentTarget;
        // The browser writes the composed text after this event.
        setTimeout(() => check(input), 0);
      }}
      onBlur={(event) => check(event.currentTarget)}
    />
  );
}
