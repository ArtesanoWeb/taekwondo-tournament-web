type ValidationIssue = { loc?: (string | number)[] };

export class ApiError extends Error {
  constructor(
    /** HTTP status code, or 0 when the server could not be reached. */
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** The API answers `{ detail: string }`, or `{ detail: [{ msg, ... }] }` for 422 validation errors. */
export function messageFromErrorBody(body: unknown, status: number): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  // Pydantic validation messages come in English, so only the field names are surfaced.
  if (Array.isArray(detail)) {
    const fields = detail
      .map((issue: ValidationIssue) => issue?.loc?.at(-1))
      .filter((field) => field !== undefined);
    return fields.length > 0
      ? `Datos no válidos en: ${[...new Set(fields)].join(", ")}`
      : "Los datos enviados no son válidos.";
  }
  return `Error inesperado del servidor (${status})`;
}

export function networkError(cause: unknown): ApiError {
  const timedOut =
    cause instanceof DOMException && cause.name === "TimeoutError";
  return new ApiError(
    0,
    timedOut
      ? "El servidor tardó demasiado en responder. Intenta de nuevo en un momento."
      : "No se pudo conectar con el servidor.",
  );
}
