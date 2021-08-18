import { popen } from "std";

const DEFAULT_OPTIONS: FetchOptions = {
  method: "GET",
  redirect: "follow",
  headers: {
    "Content-Type": "application/json",
  },
};
type FetchMethod = "POST" | "GET" | "PUT" | "DELETE" | "HEAD";

interface FetchOptions {
  method?: FetchMethod;
  headers?: { [key: string]: string };
  redirect?: string;
  body?: string;
}

export function fetch(path: string, options?: FetchOptions): Promise<any> {
  if (!options) {
    options = DEFAULT_OPTIONS;
  }

  const args = ["-s"].concat(parseOptions(options));

  return new Promise((resolve) => {
    const response = popen(`curl ${args.join(" ")} ${path}`, "r");
    resolve(response);
  });
}

function parseOptions(options: FetchOptions): string[] {
  const parsed: string[] = [];
  for (let key in options) {
    const value = options[key];
    switch (key) {
      case "method": {
        value === "HEAD" ? parsed.push("-I") : parsed.push(`-X ${value}`);
        break;
      }

      case "headers": {
        const h = Object.entries(value).reduce((pre, [key, value]) => {
          return `${pre} -H '${key}: ${value}'`;
        }, "");
        parsed.push(h);
        break;
      }

      case "redirect": {
        if (value === "follow") parsed.push("-L");
      }

      case "body": {
        if (
          (options.method === "POST" || options.method === "PUT") &&
          typeof value !== "undefined"
        )
          parsed.push(`-d ${JSON.stringify(value)}`);
      }
    }
  }
  return parsed;
}
