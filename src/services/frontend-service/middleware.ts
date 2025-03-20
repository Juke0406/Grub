// Export the bare minimum middleware function
export function middleware() {
  // Intentionally blank - just pass through all requests
}

// Explicitly declare we don't need to match any routes
export const config = {
  matcher: [],
};
