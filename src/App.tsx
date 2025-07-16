import { Table, Column } from "@speakeasy-api/moonshine";
import "./App.css";
import { data as sampleData } from "./data";
import { FuzzySearch } from "./FuzzySearch";
import { HttpLog } from "./types";
import "@speakeasy-api/moonshine/moonshine.css";
import { useState } from "react";

const columns: Column<HttpLog>[] = [
  {
    key: "id",
    header: "ID",
    width: "0.25fr",
  },
  {
    key: "domain",
    header: "Domain",
    width: "0.75fr",
  },
  {
    key: "method",
    header: "Method",
    width: "0.5fr",
  },
  {
    key: "path",
    header: "Path",
    width: "1fr",
  },
  {
    key: "statusCode",
    header: "Status Code",
    width: "0.5fr",
  },
];

function App() {
  const [data, setData] = useState<HttpLog[]>(sampleData);
  
  return (
    <div className="my-10 flex flex-col items-center gap-14 justify-start h-full">
      <FuzzySearch data={sampleData} onChange={setData} />

      <Table
        data={data}
        noResultsMessage={
          <div className="text-gray-500 p-6">No results found</div>
        }
        columns={columns}
        rowKey={(row) => row.id}
      />
    </div>
  );
}

export default App;
