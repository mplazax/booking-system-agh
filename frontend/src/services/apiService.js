// src/services/apiService.js

const API_BASE_URL = "http://localhost:8000";

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Jeśli odpowiedź NIE jest ok, od razu rzucamy błędem
  if (!response.ok) {
    // Próbujemy sparsować błąd z backendu dla lepszych komunikatów
    const errorData = await response.json().catch(() => null);
    const errorMessage =
      errorData?.detail || `HTTP error! status: ${response.status}`;

    // Rzucamy błąd, który zostanie złapany w komponencie
    throw new Error(errorMessage);
  }

  // Dla zapytań bez treści (np. DELETE 204 No Content)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
