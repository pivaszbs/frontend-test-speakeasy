import { useEffect } from "react";

export function useClickOutside(refs: React.RefObject<HTMLElement>[], onClickOutside: () => void) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!refs.some(ref => ref.current?.contains(event.target as Node))) {
        onClickOutside();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [refs, onClickOutside]);
}
