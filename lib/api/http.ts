export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function http<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      (json &&
        typeof json === "object" &&
        "message" in json &&
        typeof (json as any).message === "string" &&
        (json as any).message) ||
      res.statusText ||
      "Request failed";
    throw new HttpError(res.status, message);
  }

  return json as T;
}

