/**
 * Reusable utility for safely normalizing API responses across the Admin frontend.
 * Ensures component state receives arrays/objects safely without swallowing HTTP errors.
 */

export const normalizeListResponse = (response, keys = []) => {
  if (!response) return [];
  
  // If response is directly an array
  if (Array.isArray(response)) return response;

  const root = response?.data ?? response;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.data)) return root.data;

  const candidateKeys = [...keys, 'donations', 'users', 'ngos', 'requests', 'notifications', 'logs', 'auditLogs', 'results'];
  for (const key of candidateKeys) {
    if (Array.isArray(root?.[key])) {
      return root[key];
    }
  }

  return [];
};

export const normalizePaginationResponse = (response, keys = []) => {
  const root = response?.data ?? response;
  const items = normalizeListResponse(response, keys);
  
  const total = Number(root?.total ?? root?.data?.total ?? items.length);
  const page = Number(root?.page ?? root?.data?.page ?? 1);
  const limit = Number(root?.limit ?? root?.data?.limit ?? 10);
  const totalPages = Number(root?.totalPages ?? root?.data?.totalPages ?? Math.max(1, Math.ceil(total / (limit || 10))));

  return {
    items,
    total,
    page,
    limit,
    totalPages
  };
};

export const normalizeObjectResponse = (response, keys = []) => {
  if (!response) return {};
  const root = response?.data ?? response;
  
  if (root && typeof root === 'object' && !Array.isArray(root)) {
    for (const key of keys) {
      if (root[key] && typeof root[key] === 'object' && !Array.isArray(root[key])) {
        return root[key];
      }
    }
    return root;
  }
  return {};
};

export default {
  normalizeListResponse,
  normalizePaginationResponse,
  normalizeObjectResponse
};
