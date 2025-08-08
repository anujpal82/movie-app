import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth";
import { apiService, ApiError } from "./apiService";

const AUTH_KEY = "movie_app_auth";

function saveUser(user: User, remember?: boolean) {
  if (remember) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
}

// Interface for the actual API response
interface ApiAuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    try {
      const data = await apiService.post<ApiAuthResponse>(
        "/auth/register",
        registerData
      );

      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isAuthenticated: true,
        token: data.accessToken,
      };

      localStorage.setItem(AUTH_KEY, JSON.stringify(user));

      return {
        user,
        token: data.accessToken,
        message: "Registration successful",
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Network error occurred");
    }
  },

  async login(
    loginData: LoginRequest,
    remember?: boolean
  ): Promise<AuthResponse> {
    try {
      const data = await apiService.post<ApiAuthResponse>(
        "/auth/login",
        loginData
      );

      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isAuthenticated: true,
        token: data.accessToken,
      };

      // Persist based on remember flag (sessionStorage if not remembered)
      saveUser(user, remember);

      return {
        user,
        token: data.accessToken,
        message: "Login successful",
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Network error occurred");
    }
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser: (): User | null => {
    try {
      // Prefer session user if present; otherwise use persistent
      const userStrSession = sessionStorage.getItem(AUTH_KEY);
      const userStrLocal = localStorage.getItem(AUTH_KEY);
      const raw = userStrSession ?? userStrLocal;
      if (raw) {
        const user = JSON.parse(raw);
        // Validate that the user has required fields
        if (user && user.token && user.email && user.isAuthenticated) {
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    const user = authService.getCurrentUser();
    return Boolean(user?.isAuthenticated && user?.token);
  },

  getAuthToken: (): string | null => {
    const user = authService.getCurrentUser();
    return user?.token || null;
  },
};
