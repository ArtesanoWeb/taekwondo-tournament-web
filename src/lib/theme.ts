// Light/dark theme: the visitor's choice is stored in the browser; without one, the system's
// preference applies (and keeps applying if it changes). The `dark` class on <html> drives
// Tailwind's `dark:` variant (see globals.css).

export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

/** Runs inline in <head>, before the first paint. Plain ES5 and self-contained on purpose. */
export const themeScript = `(function () {
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  function stored() {
    try { return localStorage.getItem("${THEME_STORAGE_KEY}"); } catch (e) { return null; }
  }
  function apply() {
    var theme = stored();
    root.classList.toggle("dark", theme ? theme === "dark" : media.matches);
  }
  apply();
  media.addEventListener("change", function () { if (!stored()) apply(); });
})();`;

/** Switches to the other theme and remembers it. */
export function toggleTheme(): Theme {
  const theme: Theme = document.documentElement.classList.contains("dark")
    ? "light"
    : "dark";
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the change still applies to this page.
  }
  return theme;
}
