import { Movie } from "../types/Movie";
import { apiService, ApiError } from "./apiService";

export interface CreateMovieRequest {
  title: string;
  publishingYear: string;
  poster?: File | string;
}

export interface UpdateMovieRequest {
  title?: string;
  publishingYear?: string;
  poster?: File | string;
}

export interface MovieResponse {
  id: string;
  title: string;
  publishingYear: number;
  poster?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    page?: number;
    lastPage?: number;
    total?: number;
    pageSize?: number;
  };
}

class MovieService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
      // Prefer sessionStorage token for non-remembered sessions, fallback to localStorage
      const sessionUserStr = sessionStorage.getItem("movie_app_auth");
      const userStr = sessionUserStr ?? localStorage.getItem("movie_app_auth");
      if (!userStr) {
        throw new ApiError(401, "Authentication required");
      }

      const user = JSON.parse(userStr);
      if (!user || !user.token) {
        throw new ApiError(401, "Authentication required");
      }

      return {
        Authorization: `Bearer ${user.token}`,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(401, "Authentication required");
    }
  }

  private async createFormData(
    data: CreateMovieRequest | UpdateMovieRequest
  ): Promise<FormData> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "poster") {
          if (value instanceof File) {
            formData.append("poster", value);
          } else if (typeof value === "string") {
            // Support sending a URL string for poster
            formData.append("poster", value);
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return formData;
  }

  async getMovies(
    page: number = 1,
    pageSize: number = 8
  ): Promise<PaginatedResponse<Movie>> {
    try {
      const headers = await this.getAuthHeaders();   
      const response = await fetch(
        `${apiService["baseURL"]}/movies?page=${page}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || "Failed to fetch movies"
        );
      }

      const responseData = await response.json();
      console.log("API Response for movies:", responseData); // Debug log

      // Handle both paginated and non-paginated responses
      let movies: MovieResponse[];
      let pagination: PaginatedResponse<Movie>["pagination"];

      if (responseData.data && responseData.pagination) {
        // Paginated response from backend
        movies = responseData.data;
        pagination = {
          currentPage:
            responseData.pagination.currentPage ||
            responseData.pagination.page ||
            1,
          totalPages:
            responseData.pagination.totalPages ||
            responseData.pagination.lastPage ||
            1,
          totalItems:
            responseData.pagination.totalItems ||
            responseData.pagination.total ||
            0,
          itemsPerPage:
            responseData.pagination.itemsPerPage ||
            responseData.pagination.pageSize ||
            pageSize,
        };
      } else if (responseData.movies && responseData.pagination) {
        // Alternative paginated response structure
        movies = responseData.movies;
        pagination = {
          currentPage:
            responseData.pagination.currentPage ||
            responseData.pagination.page ||
            1,
          totalPages:
            responseData.pagination.totalPages ||
            responseData.pagination.lastPage ||
            1,
          totalItems:
            responseData.pagination.totalItems ||
            responseData.pagination.total ||
            0,
          itemsPerPage:
            responseData.pagination.itemsPerPage ||
            responseData.pagination.pageSize ||
            pageSize,
        };
      } else {
        // Non-paginated response (fallback)
        movies = Array.isArray(responseData) ? responseData : [];
        pagination = {
          currentPage: 1,
          totalPages: 1,
          totalItems: movies.length,
          itemsPerPage: movies.length,
        };
      }

      const mappedMovies = movies.map((movie: MovieResponse) => {
        console.log("Processing movie:", movie); // Debug log for each movie

        // Try to find the image URL from the poster field
        const imageUrl = movie.poster || "";

        console.log("Extracted imageUrl:", imageUrl); // Debug log for image URL

        return {
          id: movie.id,
          title: movie.title,
          publishDate: String(movie.publishingYear), // Convert number to string
          imageUrl,
          createdAt: movie.createdAt,
        };
      });

      return {
        data: mappedMovies,
        pagination,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to fetch movies");
    }
  }

  async getMovie(id: string): Promise<Movie> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${apiService["baseURL"]}/movies/${id}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || "Failed to fetch movie"
        );
      }

      const movie: MovieResponse = await response.json();
      console.log("API Response for single movie:", movie); // Debug log

      return {
        id: movie.id,
        title: movie.title,
        publishDate: String(movie.publishingYear), // Convert number to string
        imageUrl: movie.poster || "",
        createdAt: movie.createdAt,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to fetch movie");
    }
  }

  async createMovie(movieData: CreateMovieRequest): Promise<Movie> {
    try {
      const headers = await this.getAuthHeaders();
      const formData = await this.createFormData(movieData);

        const response = await fetch(`${apiService["baseURL"]}/movies`, {
        method: "POST",
        headers: {
          ...headers,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || "Failed to create movie"
        );
      }

      const movie: MovieResponse = await response.json();
      return {
        id: movie.id,
        title: movie.title,
        publishDate: String(movie.publishingYear), // Convert number to string
        imageUrl: movie.poster || "",
        createdAt: movie.createdAt,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to create movie");
    }
  }

  async updateMovie(id: string, movieData: UpdateMovieRequest): Promise<Movie> {
    try {
      const headers = await this.getAuthHeaders();
      const formData = await this.createFormData(movieData);

      const response = await fetch(`${apiService["baseURL"]}/movies/${id}`, {
        method: "PATCH",
        headers: {
          ...headers,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || "Failed to update movie"
        );
      }

      const movie: MovieResponse = await response.json();
      return {
        id: movie.id,
        title: movie.title,
        publishDate: String(movie.publishingYear), // Convert number to string
        imageUrl: movie.poster || "",
        createdAt: movie.createdAt,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to update movie");
    }
  }

  async deleteMovie(id: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${apiService["baseURL"]}/movies/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || "Failed to delete movie"
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to delete movie");
    }
  }
}

export const movieService = new MovieService();
export default movieService;
