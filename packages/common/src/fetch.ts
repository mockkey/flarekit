export async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

export async function putDate<T>(url: string, data: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await safeParseJSON(response);
    throw new FetchError(response.status, errorBody?.error || "Unknown error");
  }

  return response.json();
}

export async function postData<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await safeParseJSON(response);
    throw new FetchError(response.status, errorBody?.error || "Unknown error");
  }

  return response.json();
}

export async function deleteData<T>(
  url: string,
  data?: unknown | undefined,
): Promise<T> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : null,
  });

  if (!response.ok) {
    const errorBody = await safeParseJSON(response);
    throw new FetchError(response.status, errorBody?.error || "Unknown error");
  }

  return response.json();
}

async function safeParseJSON(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export class FetchError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "FetchError";
  }
}
