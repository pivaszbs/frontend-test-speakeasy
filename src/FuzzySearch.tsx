import { useState, useRef } from "react";
import type { HttpLog } from "./types";
import { Dropdown, DropdownOption } from "./Dropdown";
import { Tag, TagProps } from "./Tag";

// Helper to focus an input ref after a tick
function focusInput(ref: React.RefObject<HTMLInputElement>) {
  setTimeout(() => ref.current?.focus(), 0);
}

type HttpLogKey = keyof HttpLog;

export function FuzzySearch({ data, onChange }: { data: HttpLog[]; onChange: (data: HttpLog[]) => void }) {
  const [filters, setFilters] = useState<{ facet: HttpLogKey; value: string }[]>([]);
  const [startedInput, setStartedInput] = useState("");
  const [startedMode, setStartedMode] = useState<'facet' | 'value'>('facet');
  const [startedFacet, setStartedFacet] = useState<HttpLogKey | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const invisibleInputRef = useRef<HTMLInputElement>(null);
  const startedInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate facetKeys and facetOptions directly
  const facetKeys = Array.from(new Set(data.flatMap((obj: HttpLog) => Object.keys(obj)))) as HttpLogKey[];
  const facetOptions: DropdownOption[] = facetKeys
    .map(String)
    .filter(facet => !filters.some(f => f.facet === facet))
    .filter(facet => facet.toLowerCase().includes(startedInput.toLowerCase()));

  function getFacetValues(facet: HttpLogKey): DropdownOption[] {
    if (!startedFacet) return [];
    const valueFilter = startedInput.replace(`${startedFacet}:`, "");
    const filtered = filters.reduce(
      (acc, filter) => acc.filter((obj: HttpLog) => String(obj[filter.facet]).toLowerCase() === filter.value.toLowerCase()),
      data
    ).filter((logItem: HttpLog) => String(logItem[startedFacet]).toLowerCase().includes(valueFilter.toLowerCase()));
    return Array.from(new Set(filtered.map((obj: HttpLog) => obj[facet]))).map(String);
  }

  function handleTagFocus(idx: number, filter: { facet: HttpLogKey; value: string }) {
    return () => {
      const newFilters = filters.filter((_, i) => i !== idx);
      setFilters(newFilters);
      setStartedInput(`${filter.facet}:${filter.value}`.trim());
      setStartedMode('value');
      setStartedFacet(filter.facet);
      focusInput(startedInputRef);
      if (startedInputRef.current) {
        const len = startedInputRef.current.value.length;
        startedInputRef.current.setSelectionRange(len, len);
      }
    };
  }

  function handleInvisibleInputFocus() {
    setShowDropdown(true);
    if (startedInput.length > 0) {
      setStartedInput("");
      setStartedMode('facet');
      setStartedFacet(null);
      focusInput(invisibleInputRef);
    }
  }

  function focusLastTag() {
    const tagElements = containerRef.current?.querySelectorAll('[data-tag-idx]');
    if (tagElements && tagElements.length > 0) {
      const lastTag = tagElements[tagElements.length - 1] as HTMLElement;
      lastTag?.focus();
    }
  }

  function handleInvisibleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && filters.length > 0 && startedInput.length === 0) {
      e.preventDefault();
      const newFilters = filters.slice(0, -1);
      setFilters(newFilters);
      const filtered = newFilters.reduce(
        (acc, filter) => acc.filter((obj: HttpLog) => String(obj[filter.facet]).toLowerCase() === filter.value.toLowerCase()),
        data
      );
      onChange(filtered);
      return;
    }
    if (
      (e.key === 'ArrowLeft' && (invisibleInputRef.current?.selectionStart === 0))
    ) {
      if (filters.length > 0) {
        e.preventDefault();
        focusLastTag();
      }
    }
  }

  function handleInvisibleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setStartedInput(e.target.value);
    setStartedMode('facet');
    setStartedFacet(null);
    focusInput(startedInputRef);
  }

  function handleStartedInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setStartedInput(value);
    if (value.includes(":")) {
      setStartedMode('value');
      const facet = value.split(":")[0];
      setStartedFacet(facet as HttpLogKey);
    } else {
      setStartedMode('facet');
      setStartedFacet(null);
    }
    if (value.length === 0) {
      focusInput(invisibleInputRef);
    }
    setShowDropdown(true);
  }

  const dropdownOptions: DropdownOption[] =
    startedMode === 'facet'
      ? facetOptions
      : startedFacet
        ? getFacetValues(startedFacet)
        : [];

  function handleSelect(value: string) {
    if (startedMode === 'facet') {
      setStartedInput(`${value}:`);
      setStartedMode('value');
      setStartedFacet(value as HttpLogKey);
      setShowDropdown(true);
      focusInput(startedInputRef);
    } else if (startedMode === 'value' && startedFacet) {
      const newFilters = [...filters, { facet: startedFacet, value }];
      setFilters(newFilters);
      const filtered = newFilters.reduce(
        (acc, filter) => acc.filter((obj: HttpLog) => String(obj[filter.facet]).toLowerCase() === filter.value.toLowerCase()),
        data
      );
      onChange(filtered);
      setStartedInput("");
      setStartedMode('facet');
      setStartedFacet(null);
      setShowDropdown(false);
      focusInput(invisibleInputRef);
    }
  }

  function handleClose() {
    setShowDropdown(false);
  }

  function handleRemoveFilter(idx: number) {
    const newFilters = filters.filter((_, i) => i !== idx);
    setFilters(newFilters);
    const filtered = newFilters.reduce(
      (acc, filter) => acc.filter((obj: HttpLog) => String(obj[filter.facet]).toLowerCase() === filter.value.toLowerCase()),
      data
    );
    onChange(filtered);
    focusInput(invisibleInputRef);
  }
  
  return (
    <div className="w-full">
      <div
        className="bg-background placeholder:text-muted-foreground text-foreground w-full rounded-md py-2 text-sm shadow-sm outline-none placeholder:transition-colors placeholder:duration-500 disabled:cursor-not-allowed disabled:opacity-50 border flex flex-wrap gap-2 items-center px-2"
        ref={containerRef}
      >
        {filters.map((filter, idx) => (
          <Tag
            key={idx}
            state="completed"
            onClick={() => handleRemoveFilter(idx)}
            tabIndex={0}
            data-tag-idx={idx}
            onFocus={handleTagFocus(idx, filter)}
          >
            {filter.facet}: {filter.value} ✕
          </Tag>
        ))}
        {/* Started input inside tag */}
        {startedInput.length > 0 && (
          <Tag state="started">
            <input
              ref={startedInputRef}
              value={startedInput}
              onChange={handleStartedInputChange}
              size={startedInput.length}
              onFocus={() => setShowDropdown(true)}
              className="w-full rounded-md py-0 text-sm shadow-sm outline-none placeholder:transition-colors placeholder:duration-500 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ minWidth: 40, width: 'auto', display: 'inline-block', background: 'transparent', color: 'inherit' }}
              autoFocus
            />
          </Tag>
        )}
        {/* Invisible input (always present, full width) */}
        <input
          ref={invisibleInputRef}
          className="flex-1 bg-transparent border-none outline-none min-w-[80px]"
          style={{ minWidth: 80, width: startedInput.length > 0 ? 0 : '100%', opacity: startedInput.length > 0 ? 0.2 : 1, transition: 'opacity 0.2s' }}
          value={''}
          // onBlur={handleClose}
          onFocus={handleInvisibleInputFocus}
          onChange={handleInvisibleInputChange}
          onKeyDown={handleInvisibleInputKeyDown}
          tabIndex={0}
          placeholder={filters.length === 0 && startedInput.length === 0 ? 'Type to add filter…' : ''}
          aria-label="Add filter"
        />
      </div>
      <Dropdown
        options={dropdownOptions}
        anchorRef={containerRef}
        visible={showDropdown}
        onSelect={handleSelect}
        onClose={handleClose}
        filter={startedMode === 'facet'
          ? startedInput
          : startedFacet
            ? startedInput.replace(`${startedFacet}:`, '')
            : ''}
      />
    </div>
  );
}
