
import { useState, useRef } from "react";
import type { HttpLog } from "./types";
import { Dropdown, DropdownOption } from "./Dropdown";
// Tag component with states: 'started' and 'completed'
interface TagProps {
  children: React.ReactNode;
  state: 'started' | 'completed';
  onClick?: () => void;
}

function Tag({ children, state, onClick }: TagProps) {
  const base =
    "inline-flex select-none rounded-full px-3 py-1 text-sm cursor-pointer transition-colors";
  const started =
    "bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 shadow-sm";
  const completed =
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-secondary-300 shadow";
  return (
    <div
      className={
        base +
        " " +
        (state === "started" ? started : completed)
      }
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface FuzzySearchProps {
  data: HttpLog[];
  onChange: (data: HttpLog[]) => void;
}

type HttpLogKey = keyof HttpLog;

export function FuzzySearch({ data, onChange }: FuzzySearchProps) {
  // Completed tags
  const [filters, setFilters] = useState<{ facet: HttpLogKey; value: string }[]>([]);
  // Tag in progress ("started" input)
  const [startedInput, setStartedInput] = useState("");
  const [startedMode, setStartedMode] = useState<'facet' | 'value'>('facet');
  const [startedFacet, setStartedFacet] = useState<HttpLogKey | null>(null);
  // Dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  // Invisible input (always present, full width)
  const invisibleInputRef = useRef<HTMLInputElement>(null);
  const startedInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const facetKeys = Array.from(new Set(data.flatMap((obj: HttpLog) => Object.keys(obj)))) as HttpLogKey[];
  const facetOptions: DropdownOption[] = facetKeys.map(String)
    .filter(facet => !filters.some(f => f.facet === facet))
    .filter(facet => facet.toLowerCase().includes(startedInput.toLowerCase())
  );

  // Get unique values for a facet
  const getFacetValues = (facet: HttpLogKey): DropdownOption[] => {
    if (!startedFacet) return [];

    const valueFilter = startedInput.replace(`${startedFacet}:`, "");
    const filtered = filters.reduce(
      (acc, filter) => acc.filter((obj: HttpLog) => String(obj[filter.facet]).toLowerCase() === filter.value.toLowerCase()),
      data
    ).filter(logItem => String(logItem[startedFacet]).toLowerCase().includes(valueFilter.toLowerCase()));
    return Array.from(new Set(filtered.map((obj: HttpLog) => obj[facet]))).map(String);
  };

  // Invisible input handlers
  const handleInvisibleInputFocus = () => {
    setShowDropdown(true);
    // If there is a started input, clear it (delete incomplete tag)
    if (startedInput.length > 0) {
      setStartedInput("");
      setStartedMode('facet');
      setStartedFacet(null);
      setTimeout(() => invisibleInputRef.current?.focus(), 0);
    }
  };

  const handleInvisibleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Move value to started input and focus it
    setStartedInput(e.target.value);
    setStartedMode('facet');
    setStartedFacet(null);
    setTimeout(() => startedInputRef.current?.focus(), 0);
  };

  // Started input handlers
  const handleStartedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setTimeout(() => invisibleInputRef.current?.focus(), 0);
    }
    setShowDropdown(true);
  };

  const dropdownOptions: DropdownOption[] = startedMode === 'facet'
    ? facetOptions
    : startedFacet
      ? getFacetValues(startedFacet)
      : [];

  const handleSelect = (value: string) => {
    if (startedMode === 'facet') {
      setStartedInput(`${value}:`);
      setStartedMode('value');
      setStartedFacet(value as HttpLogKey);
      setShowDropdown(true);
      setTimeout(() => startedInputRef.current?.focus(), 0);
    } else if (startedMode === 'value' && startedFacet) {
      // Add filter badge
      const newFilters = [...filters, { facet: startedFacet, value }];
      setFilters(newFilters);
      // Filter data and call onChange
      const filtered = newFilters.reduce(
        (acc, filter) => acc.filter((obj: HttpLog) => String(obj[filter.facet]).toLowerCase() === filter.value.toLowerCase()),
        data
      );
      onChange(filtered);
      setStartedInput("");
      setStartedMode('facet');
      setStartedFacet(null);
      setShowDropdown(false);
      setTimeout(() => invisibleInputRef.current?.focus(), 0);
    }
  };

  const handleClose = () => {
    setShowDropdown(false);
  };

  const handleRemoveFilter = (idx: number) => {
    const newFilters = filters.filter((_, i) => i !== idx);
    setFilters(newFilters);
    const filtered = newFilters.reduce(
      (acc, filter) => acc.filter((obj: HttpLog) => String(obj[filter.facet]).toLowerCase() === filter.value.toLowerCase()),
      data
    );
    onChange(filtered);
    setTimeout(() => invisibleInputRef.current?.focus(), 0);
  };

  return (
    <div className="w-full">
      <div
        className="bg-background placeholder:text-muted-foreground text-foreground w-full rounded-md py-2 text-sm shadow-sm outline-none placeholder:transition-colors placeholder:duration-500 disabled:cursor-not-allowed disabled:opacity-50 border flex flex-wrap gap-2 items-center px-2"
        ref={containerRef}
      >
        {/* Completed tags */}
        {filters.map((filter, idx) => (
          <Tag
            key={idx}
            state="completed"
            onClick={() => handleRemoveFilter(idx)}
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
              size={Math.max(1, startedInput.length)}
              onFocus={() => setShowDropdown(true)}
              onBlur={handleInvisibleInputFocus}
              placeholder={startedMode === 'facet' ? 'Choose a facet…' : startedFacet ? `Choose value for ${startedFacet}…` : ''}
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
          onFocus={handleInvisibleInputFocus}
          onChange={handleInvisibleInputChange}
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
