
import { useState, useRef } from "react";
import type { HttpLog } from "./types";
import { Dropdown, DropdownOption } from "./Dropdown";
import { Input } from "@speakeasy-api/moonshine";
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
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mode, setMode] = useState<'facet' | 'value'>('facet');
  const [selectedFacet, setSelectedFacet] = useState<HttpLogKey | null>(null);
  // Store selected filters as array of {facet, value}
  const [filters, setFilters] = useState<{ facet: HttpLogKey; value: string }[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);
  const facetKeys = Array.from(new Set(data.flatMap((obj: HttpLog) => Object.keys(obj)))) as HttpLogKey[];
  const facetOptions: DropdownOption[] = facetKeys.map(String)
    .filter(facet => !filters.some(f => f.facet === facet))
    .filter(facet => facet.startsWith(inputValue)
  );

  // Get unique values for a facet
  const getFacetValues = (facet: HttpLogKey): DropdownOption[] => {
    if (!selectedFacet) return [];

    const valueFilter = inputValue.replace(`${selectedFacet}:`, '');

    const filtered = filters.reduce(
        (acc, filter) => acc.filter((obj: HttpLog) => String(obj[filter.facet]) === filter.value),
        data
      ).filter(logItem => String(logItem[selectedFacet]).startsWith(valueFilter));

    return Array.from(new Set(filtered.map((obj: HttpLog) => obj[facet]))).map(String);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.charAt(e.target.value.length - 1) === ":") {
      setMode('value');
    } else if (inputValue.charAt(inputValue.length - 1) === ":" && e.target.value.length - inputValue.length === -1) {
      setMode('facet');
    }

    setInputValue(e.target.value);
    setShowDropdown(true);
  };

  const dropdownOptions: DropdownOption[] = mode === 'facet'
    ? facetOptions
    : selectedFacet
      ? getFacetValues(selectedFacet)
      : [];

  const handleSelect = (value: string) => {
    if (mode === 'facet') {
      setSelectedFacet(value as HttpLogKey);
      setInputValue(`${value}:`);
      setMode('value');
      setShowDropdown(true);
    } else if (mode === 'value' && selectedFacet) {
      // Add filter badge
      const newFilters = [...filters, { facet: selectedFacet, value }];
      setFilters(newFilters);
      // Filter data and call onChange
      const filtered = newFilters.reduce(
        (acc, filter) => acc.filter((obj: HttpLog) => String(obj[filter.facet]) === filter.value),
        data
      );
      onChange(filtered);
      setInputValue("");
      setShowDropdown(false);
      setMode('facet');
      setSelectedFacet(null);
    }
  };

  const handleClose = () => {
    setShowDropdown(false);
    setMode('facet');
    setSelectedFacet(null);
  };

  const handleRemoveFilter = (idx: number) => {
    const newFilters = filters.filter((_, i) => i !== idx);
    setFilters(newFilters);
    const filtered = newFilters.reduce(
      (acc, filter) => acc.filter((obj: HttpLog) => String(obj[filter.facet]) === filter.value),
      data
    );
    onChange(filtered);
  };

  return (
    <div className="w-full" ref={inputRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {filters.map((filter, idx) => (
          <Tag
            key={idx}
            state="started"
            onClick={() => handleRemoveFilter(idx)}
          >
            {filter.facet}: {filter.value} ✕
          </Tag>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={() => setShowDropdown(true)}
        placeholder={mode === 'facet' ? 'Choose a facet…' : selectedFacet ? `Choose value for ${selectedFacet}…` : ''}
      />
      <Dropdown
        options={dropdownOptions}
        anchorRef={inputRef}
        visible={showDropdown}
        onSelect={handleSelect}
        onClose={handleClose}
      />
    </div>
  );
}
