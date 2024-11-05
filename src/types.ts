export interface HttpLog {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  statusCode: number;
  id: string;
  domain: string;
}
