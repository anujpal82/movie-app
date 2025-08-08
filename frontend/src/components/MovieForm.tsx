import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X, LogOut } from "lucide-react";
import {
  movieService,
  CreateMovieRequest,
  UpdateMovieRequest,
} from "../services/movieService";
import { authService } from "../services/authService";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { ApiError } from "../services/apiService";

const MovieForm: React.FC = () => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  // Remove theme state to avoid unused variable; inputs use Tailwind classes now
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const hasLoadedMovie = useRef(false);

  useEffect(() => {
    if (isEditing && id && !hasLoadedMovie.current) {
      loadMovie();
      hasLoadedMovie.current = true;
    }
  }, [id, isEditing]);

  // Removed dynamic background logic to ensure external poster URL styling is bounded to image area only

  const loadMovie = async () => {
    try {
      const movie = await movieService.getMovie(id!);
      setTitle(movie.title);
      setPublishDate(String(movie.publishDate || ""));
      setImageUrl(movie.imageUrl || "");
      setImagePreview(movie.imageUrl || "");
    } catch (error) {
      console.error("Failed to load movie:", error);
      if (window.showToast) {
        window.showToast({
          type: "error",
          message: "Failed to load movie. Please try again.",
        });
      }
      navigate("/movies");
    }
  };

  const handleImageFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setImageUrl("");
        setErrors((prev) => ({ ...prev, image: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setImagePreview(url);
      setImageFile(null);
      setErrors((prev) => ({ ...prev, image: "" }));
    } else {
      setImagePreview("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
    // Clear any image-related errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = t("movieform.title_required");
    }

    if (!String(publishDate).trim()) {
      newErrors.publishDate = t("movieform.publish_date_required");
    }

    if (!imagePreview && !imageUrl) {
      newErrors.image = t("movieform.image_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      if (window.showToast) {
        window.showToast({
          type: "error",
          message: "Please fix the errors in the form before submitting.",
        });
      }
      return;
    }

    setLoading(true);

    try {
      const fetchImageAsFile = async (url: string): Promise<File | null> => {
        try {
          const response = await fetch(url);
          if (!response.ok) return null;
          const blob = await response.blob();

          // Derive filename
          const urlPath = url.split("?")[0];
          const lastSegment =
            urlPath.substring(urlPath.lastIndexOf("/") + 1) || "poster";

          // Determine extension
          const contentType =
            blob.type || response.headers.get("content-type") || "image/jpeg";
          const defaultExt = contentType.includes("png")
            ? "png"
            : contentType.includes("webp")
            ? "webp"
            : contentType.includes("gif")
            ? "gif"
            : "jpg";

          const hasExt = /\.(png|jpe?g|webp|gif)$/i.test(lastSegment);
          const filename = hasExt
            ? lastSegment
            : `${lastSegment}.${defaultExt}`;

          return new File([blob], filename, { type: contentType });
        } catch {
          return null; // Likely CORS or network issue
        }
      };

      // Normalize poster to a File when URL is provided
      let normalizedPoster: File | string | undefined;
      if (imageUrl && !imageFile) {
        const downloaded = await fetchImageAsFile(imageUrl);
        normalizedPoster = downloaded || imageUrl; // fallback to URL if CORS blocks
      } else if (imageFile) {
        normalizedPoster = imageFile;
      }

      if (isEditing && id) {
        const updateData: UpdateMovieRequest = {
          title,
          publishingYear: publishDate,
        };

        if (normalizedPoster) {
          updateData.poster = normalizedPoster as File | string;
        }

        await movieService.updateMovie(id, updateData);

        if (window.showToast) {
          window.showToast({
            type: "success",
            message: "Movie updated successfully!",
          });
        }
      } else {
        const createData: CreateMovieRequest = {
          title,
          publishingYear: publishDate,
        };

        if (normalizedPoster) {
          createData.poster = normalizedPoster as File | string;
        }

        await movieService.createMovie(createData);

        if (window.showToast) {
          window.showToast({
            type: "success",
            message: "Movie created successfully!",
          });
        }
      }

      setTimeout(() => {
        navigate("/movies");
      }, 1500);
    } catch (error) {
      console.error("Failed to save movie:", error);

      let errorMessage = "Failed to save movie. Please try again.";
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      if (window.showToast) {
        window.showToast({
          type: "error",
          message: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 border-b border-input">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => navigate("/movies")}
                className="p-2 text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-white flex-shrink-0">
                {isEditing
                  ? t("movieform.edit_movie")
                  : t("movieform.create_movie")}
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <LanguageSwitcher />
              <div className="w-px h-6 bg-input"></div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-error/20 hover:bg-error/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <span className="text-white">{t("common.logout")}</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
          {/* Image Upload Area */}
          <div className="space-y-4">
            <div
              className={`aspect-[3/4] border-2 border-dashed rounded-lg p-8 flex items-center justify-center relative transition-colors ${
                dragActive ? "border-primary bg-primary/10" : ""
              } ${errors.image ? "border-error" : "border-input"}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Movie poster"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-error hover:bg-error/80 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">
                    {t("movieform.drop_image")}
                  </p>
                  <p className="text-slate-500 text-sm mb-4">
                    {t("movieform.click_browse")}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {errors.image && (
              <p className="text-error text-sm">{errors.image}</p>
            )}

            <input
              type="url"
              placeholder={t("movieform.enter_image_url")}
              value={imageUrl}
              onChange={handleImageUrlChange}
              className={`w-full px-4 py-3 bg-input/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                errors.image ? "border-error" : "border-input"
              }`}
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-3">
                {t("movieform.title")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3 bg-input/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  errors.title ? "border-error" : "border-input"
                }`}
                placeholder={t("movieform.enter_movie_title")}
                required
              />
              {errors.title && (
                <p className="text-error text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">
                {t("movieform.publishing_year")}
              </label>
              <input
                type="text"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className={`w-full px-4 py-3 bg-input/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  errors.publishDate ? "border-error" : "border-input"
                }`}
                placeholder={t("movieform.enter_publishing_year")}
                required
              />
              {errors.publishDate && (
                <p className="text-error text-sm mt-1">{errors.publishDate}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-8">
              <button
                type="button"
                onClick={() => navigate("/movies")}
                className="flex-1 bg-card hover:bg-card/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {t("movieform.cancel")}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/80 disabled:bg-primary/60 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading
                  ? t("movieform.saving")
                  : isEditing
                  ? t("movieform.update")
                  : t("movieform.submit")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
