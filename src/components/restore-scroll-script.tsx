import { SCROLL_PREFIX } from "@/lib/scroll-memory";

/**
 * Render right after a sideways scroller. On a full page load it puts the scroll back where it
 * was left (`scroll-memory`) before the first paint and before React: otherwise the first screen
 * would show the start and then jump. Streamed content arrives in a hidden container and is moved
 * into place later, so it waits frame by frame (up to ~2 s) until the scroller is visible; the
 * frame callback runs before that frame paints. After that, the component's own effects take over.
 *
 * - `tab`: the stored value is a panel index; the scroller's children are the panels (only below
 *   `lg`, where they are tabs).
 * - `offset`: the stored value is the scroll position in px.
 */
export function RestoreScrollScript({
  storageKey,
  mode,
}: {
  storageKey: string;
  mode: "tab" | "offset";
}) {
  const key = JSON.stringify(SCROLL_PREFIX + storageKey);
  const apply =
    mode === "tab"
      ? 'if(matchMedia("(min-width: 64rem)").matches)return;var p=s.children[+v];if(p)s.scrollLeft=p.offsetLeft;'
      : "s.scrollLeft=+v;";
  const code = `(function(){try{var s=document.currentScript.previousElementSibling,v=sessionStorage.getItem(${key}),n=0;if(!s||v===null)return;(function f(){if(s.offsetParent===null&&n++<120){requestAnimationFrame(f);return}${apply}})()}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
