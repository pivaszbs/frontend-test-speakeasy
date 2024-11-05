import { HttpLog } from "./types";

export const data: HttpLog[] = [
  {
    method: "GET",
    path: "/",
    statusCode: 200,
    id: "1",
    domain: "example.com",
  },
  {
    method: "POST",
    path: "/api/v1/users",
    statusCode: 201,
    id: "2",
    domain: "example.com",
  },
  {
    method: "GET",
    path: "/api/v1/users/1",
    statusCode: 200,
    id: "3",
    domain: "example.com",
  },
  {
    method: "DELETE",
    path: "/api/v1/users/1",
    statusCode: 204,
    id: "4",
    domain: "example.com",
  },
  {
    method: "GET",
    path: "/api/v1/users/2",
    statusCode: 404,
    id: "5",
    domain: "example.com",
  },
  {
    method: "GET",
    path: "/api/v1/users/3",
    statusCode: 404,
    id: "6",
    domain: "example.com",
  },
  {
    method: "GET",
    path: "/api/v1/users/4",
    statusCode: 404,
    id: "7",
    domain: "example.com",
  },
  {
    method: "GET",
    path: "/api/v1/users/5",
    statusCode: 404,
    id: "8",
    domain: "example.com",
  },
];
