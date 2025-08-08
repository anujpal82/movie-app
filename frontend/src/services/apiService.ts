const API_BASE_URL = "http://localhost:3001";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

class ApiService {
  public baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } else {
      if (!response.ok) {
        throw new ApiError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return response.text() as T;
    }
  }

  private getHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private getAuthToken(): string | null {
    // Prefer sessionStorage (non-remembered logins), fallback to localStorage
    const sessionUser = sessionStorage.getItem("movie_app_auth");
    const localUser = localStorage.getItem("movie_app_auth");
    const raw = sessionUser ?? localUser;
    if (!raw) return null;
    try {
      const user = JSON.parse(raw);
      return user?.token || null;
    } catch {
      return null;
    }
  }

  async get<T>(
    endpoint: string,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(customHeaders),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(
    endpoint: string,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(customHeaders),
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiService = new ApiService();
export default apiService;
