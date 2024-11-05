import "./App.css";
import { data } from "./data";
import { FuzzySearch } from "./FuzzySearch";

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <FuzzySearch data={data} />
    </div>
  );
}

export default App;
