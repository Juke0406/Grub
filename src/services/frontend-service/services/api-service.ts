// apiService.ts

export interface APIKey {
  id: string;
  key: string;
  created_at: string;
  last_used: string | null;
  usageCount?: number;
  expires_at?: string; 
  monthly_cost?: string;
}

export interface CreateApiKeyResponse {
  message: string;
  key: string;
  id: string;
  created_at: string;
  expiresAt: string;
  usageCount: number;
}

export interface DeleteApiKeyResponse {
    message: string;
}

// const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api_keys` || 'http://localhost:8080/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "/api";

// Function to create a new API key for a specific user
export const createApiKey = async (userId: string): Promise<CreateApiKeyResponse> => {
  const response = await fetch(`${API_BASE_URL}/api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId, // use camelCase
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // optional, or let backend default to 30 days
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create API key: ${response.statusText}`);
  }

  const data: CreateApiKeyResponse = await response.json();
  return data;
};


// Function to delete an existing API key by its ID
export const deleteApiKey = async (key: string) => {
  const response = await fetch(`${API_BASE_URL}/api-key`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }), // pass { key: "actual-api-key-string" }
  });

  if (!response.ok) {
    throw new Error(`Failed to delete API key: ${response.statusText}`);
  }
};


// // Function to retrieve all API keys for a specific user
// export const getApiKeys = async (userId: string): Promise<APIKey[]> => {
//   const response = await fetch(`${API_BASE_URL}/${Number(userId)}`);

//   if (!response.ok) {
//     throw new Error(`Failed to fetch API keys: ${response.statusText}`);
//   }

//   const data: APIKey[] = await response.json();
//   return data;
// };
// services/api-service.ts

export async function getApiKeys(userId: string) {
  if (!userId) {
    throw new Error("User ID is undefined or empty");
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""; // fallback to empty if running on client side

  // Use relative path if local
  const url = baseUrl ? `${baseUrl}/api/api-key?userId=${userId}` : `/api/api-key?userId=${userId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch API keys: ${response.statusText}`);
  }

  const data: APIKey[] = await response.json();
  return data;
}



