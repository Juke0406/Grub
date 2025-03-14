// apiService.ts

export interface APIKey {
    id: number;
    name: string;
    key: string;
    created_at: string;
    last_used: string | null;
    usage_count?: number;
    monthly_cost?: string;
}

export interface CreateApiKeyResponse {
    message: string;
    key: string;
}

export interface DeleteApiKeyResponse {
    message: string;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api_keys` || 'http://localhost:8080/api';

// Function to create a new API key for a specific user
export const createApiKey = async (userId: string, name: string): Promise<CreateApiKeyResponse> => {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: Number(userId), name }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create API key: ${response.statusText}`);
  }

  const data: CreateApiKeyResponse = await response.json();
  return data;
};

// Function to delete an existing API key by its ID
export const deleteApiKey = async (keyId: number): Promise<DeleteApiKeyResponse> => {
  const response = await fetch(`${API_BASE_URL}/${keyId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete API key: ${response.statusText}`);
  }

  const data: DeleteApiKeyResponse = await response.json();
  return data;
};

// Function to retrieve all API keys for a specific user
export const getApiKeys = async (userId: string): Promise<APIKey[]> => {
  const response = await fetch(`${API_BASE_URL}/${Number(userId)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch API keys: ${response.statusText}`);
  }

  const data: APIKey[] = await response.json();
  return data;
};
