import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useClickOutside } from "./useClickOutside";


export type DropdownOption = string;

interface DropdownProps {
  options: DropdownOption[];
  anchorRef: React.RefObject<HTMLElement>;
  visible: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
  filter?: string;
}

function highlightMatch(option: string, filter: string | undefined) {
  if (!filter) return option;
  const idx = option.toLowerCase().indexOf(filter.toLowerCase());
  if (idx === -1) return option;
  return (
    <>
      {option.slice(0, idx)}
      <span className="font-bold">{option.slice(idx, idx + filter.length)}</span>
      {option.slice(idx + filter.length)}
    </>
  );
}

export const Dropdown = ({ options, anchorRef, visible, onSelect, onClose, filter }: DropdownProps) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [visible, anchorRef]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!visible) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % options.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSelect(options[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visible, activeIndex, options, onSelect]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside([anchorRef, dropdownRef], () => onClose());

  if (!visible || options.length === 0) return null;

  return ReactDOM.createPortal(
    <div ref={dropdownRef} style={style} className="border border-dashed border-gray-300 bg-zinc-900 text-white mt-1 rounded-md shadow">
      {options.map((option, index) => (
        <div
          key={option}
          onClick={() => onSelect(option)}
          className={`p-2 cursor-pointer hover:bg-zinc-800 ${index === activeIndex ? "bg-zinc-800" : ""}`}
        >
          {highlightMatch(option, filter)}
        </div>
      ))}
    </div>,
    document.body
  );
};

