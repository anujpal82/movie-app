import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, LogOut, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { CgAdd } from "react-icons/cg";
import { movieService, PaginatedResponse } from "../services/movieService";
import { authService } from "../services/authService";
import { Movie } from "../types/Movie";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { ApiError } from "../services/apiService";
import ConfirmationPopup from "./ConfirmationPopup";

const DEFAULT_MOVIES_PER_PAGE = 8;
const PER_PAGE_OPTIONS = [8, 12, 16, 20];

const MovieList: React.FC = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_MOVIES_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Confirmation popup state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [deletingMovie, setDeletingMovie] = useState(false);

  useEffect(() => {
    loadMovies(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const loadMovies = async (
    page: number = 1,
    pageSize: number = DEFAULT_MOVIES_PER_PAGE
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<Movie> = await movieService.getMovies(
        page,
        pageSize
      );
      setMovies(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setCurrentPage(response.pagination.currentPage);
      setItemsPerPage(response.pagination.itemsPerPage);
    } catch (error) {
      console.error("Failed to fetch movies:", error);

      if (error instanceof ApiError) {
        if (error.status === 401) {
          setError("Authentication required. Please log in again.");
          setTimeout(() => {
            window.location.href = "/signin";
          }, 2000);
        } else {
          setError(error.message);
        }
      } else {
        setError("Failed to load movies. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/signin");
  };

  const handleDeleteClick = (movie: Movie, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMovieToDelete(movie);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!movieToDelete) return;

    try {
      setDeletingMovie(true);
      await movieService.deleteMovie(movieToDelete.id);

      // Reload current page to refresh the list
      await loadMovies(currentPage, itemsPerPage);

      // Show success toast
      if (window.showToast) {
        window.showToast({
          type: "success",
          message: "Movie deleted successfully!",
        });
      }
    } catch (error) {
      console.error("Failed to delete movie:", error);

      let errorMessage = "Failed to delete movie. Please try again.";
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      // Show error toast
      if (window.showToast) {
        window.showToast({
          type: "error",
          message: errorMessage,
        });
      }
    } finally {
      setDeletingMovie(false);
      setShowDeleteConfirm(false);
      setMovieToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setMovieToDelete(null);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const EmptyState = () => (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <LanguageSwitcher />
        <div className="w-px h-6 bg-input hidden sm:block"></div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 bg-error/20 hover:bg-error/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
        >
          <span className="text-white hidden sm:inline">
            {t("common.logout")}
          </span>
          <span className="text-white sm:hidden">Logout</span>
          <LogOut className="w-4 h-4" />
        </button>
      </div>
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
          {t("movielist.empty_title")}
        </h2>
        <Link
          to="/movies/create"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t("movielist.add_new")}
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Error Loading Movies
          </h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => loadMovies(currentPage, itemsPerPage)}
            className="bg-primary hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (movies.length === 0 && totalItems === 0) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 border-b border-input">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            {/* Title and Movie Count */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex-shrink-0">
                {t("movielist.my_movies")}
              </h1>
              {totalItems > 0 && (
                <span className="text-slate-400 text-sm flex-shrink-0">
                  ({totalItems} {totalItems === 1 ? "movie" : "movies"})
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <LanguageSwitcher />
              <div className="w-px h-6 bg-input hidden sm:block"></div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-error/20 hover:bg-error/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <span className="text-white hidden sm:inline">
                  {t("common.logout")}
                </span>
                <span className="text-white sm:hidden">Logout</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Controls Bar */}
        <div className="flex justify-between items-center mb-8">
          {/* Per Page Selector */}
          <div className="flex items-center gap-3">
            <label className="text-white text-sm font-medium">
              {t("movielist.show_per_page")}:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="bg-input/50 border border-input rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-background">
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Add Movie Button */}
          <Link
            to="/movies/create"
            className="inline-flex items-center justify-center w-10 h-10 bg-primary hover:bg-primary/80 text-white rounded-full transition-colors"
          >
            <CgAdd size={20} />
          </Link>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              to={`/movies/edit/${movie.id}`}
              className="group cursor-pointer"
            >
              <div className="bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden border border-input hover:border-input/80 transition-all duration-500 ease-in-out hover:scale-[1.02] hover:shadow-lg relative h-96 flex flex-col">
                {/* Poster area */}
                <div className="flex-1 bg-input relative overflow-hidden transition-all duration-500 ease-in-out">
                  {movie.imageUrl ? (
                    <img
                      src={movie.imageUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                      onError={(e) => {
                        console.error("Failed to load image:", movie.imageUrl);
                        console.error("Error event:", e);
                        // Hide the image on error
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                      onLoad={() => {
                        console.log(
                          "Successfully loaded image:",
                          movie.imageUrl
                        );
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="text-sm">No Image</span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out flex items-center justify-center">
                    <Edit className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Info area pinned to bottom */}
                <div className="p-4 flex-none flex flex-col justify-center">
                  <h3 className="text-white font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{movie.publishDate}</p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteClick(movie, e)}
                  className="absolute top-2 right-2 w-8 h-8 bg-error hover:bg-error/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-sm font-bold"
                  title="Delete movie"
                >
                  ×
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4">
            {/* Pagination Info */}
            <div className="text-slate-400 text-sm">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              movies
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "text-slate-400 hover:text-white hover:bg-card"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Movie"
        message={`Are you sure you want to delete "${movieToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Movie"
        cancelText="Cancel"
        type="danger"
        loading={deletingMovie}
      />
    </div>
  );
};

export default MovieList;
