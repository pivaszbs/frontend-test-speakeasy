import { useState, useEffect, useRef, act } from "react";
import ReactDOM from "react-dom";

export type DropdownOption = string;

interface DropdownProps {
  options: DropdownOption[];
  anchorRef: React.RefObject<HTMLElement>;
  show: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
  filter?: string;
  initialActiveIndex?: number;
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

export const Dropdown = ({ options, anchorRef, show, onSelect, onClose, filter, initialActiveIndex }: DropdownProps) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const visible = show && options.length > 0;

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

  // Keyboard navigation and focus are handled internally

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Internal keyboard navigation (only when visible)
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % options.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
      } else if (e.key === "Enter" || e.key === " ") {

        e.preventDefault();
        onSelect(options[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visible, options, onSelect, onClose, activeIndex]);

  useEffect(() => {
    if (activeIndex >= options.length) {
      setActiveIndex(options.length - 1);
    }
    if (activeIndex < 0) {
      setActiveIndex(0);
    }
  }, [visible, initialActiveIndex, options.length]);


  // Set activeIndex when dropdown is opened and initialActiveIndex changes
  useEffect(() => {
    if (visible && typeof initialActiveIndex === 'number' && options.length > 0) {
      setActiveIndex(Math.max(0, Math.min(initialActiveIndex, options.length - 1)));
    }
  }, [visible, initialActiveIndex, options.length]);

  if (!visible || options.length === 0) return null;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      style={style}
      className="border border-dashed border-gray-300 bg-zinc-900 text-white mt-1 rounded-md shadow"
      role="listbox"
      aria-activedescendant={options[activeIndex] ? `dropdown-option-${options[activeIndex]}` : undefined}
      tabIndex={-1}
    >
      {options.map((option, index) => (
        <div
          key={option}
          id={`dropdown-option-${option}`}
          ref={el => optionRefs.current[index] = el}
          role="option"
          aria-selected={index === activeIndex}
          tabIndex={-1}
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

