interface FuzzySearchProps<T> {
  data: T[];
  onChange: (data: T[]) => void;
}

export function FuzzySearch<T>(props: FuzzySearchProps<T>) {
  return (
    <div className="border bg-zinc-900 border-dashed w-full border-gray-300 rounded-md p-4">
      <h1>Implement this component!</h1>
    </div>
  );
}
