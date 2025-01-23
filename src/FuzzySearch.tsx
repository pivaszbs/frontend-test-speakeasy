import type { HttpLog } from "./types";

interface FuzzySearchProps {
  data: HttpLog[];
  onChange: (data: HttpLog[]) => void;
}

export function FuzzySearch({ data, onChange }: FuzzySearchProps) {
  return (
    <div className="border bg-zinc-900 border-dashed w-full border-gray-300 rounded-md p-4">
      <h1>Implement this component!</h1>
    </div>
  );
}
