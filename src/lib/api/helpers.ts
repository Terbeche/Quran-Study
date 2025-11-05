import { NextResponse } from 'next/server';

/**
 * Returns a standardized 400 Bad Request response
 */
export function badRequest(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

/**
 * Returns a standardized 500 Internal Server Error response
 */
export function internalError(message: string = 'Internal server error') {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}

/**
 * Validates required query parameters
 * @returns error response or null if all valid
 */
export function validateRequiredParams(
  params: Record<string, string | null>,
  requiredKeys: string[]
): NextResponse | null {
  const missing = requiredKeys.filter(key => !params[key]);
  
  if (missing.length > 0) {
    return badRequest(
      `Missing required parameter${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`
    );
  }
  
  return null;
}

/**
 * Validates that parameters are valid numbers
 * @returns error response or null if all valid
 */
export function validateNumberParams(
  params: Record<string, string>,
  keys: string[]
): NextResponse | null {
  const invalid = keys.filter(key => Number.isNaN(Number.parseInt(params[key], 10)));
  
  if (invalid.length > 0) {
    return badRequest(
      `Invalid parameter${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')} must be number${invalid.length > 1 ? 's' : ''}`
    );
  }
  
  return null;
}
