import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Movie, MovieDocument } from "./schemas/movie.schema";
import {
  CreateMovieDto,
  UpdateMovieDto,
  MovieResponseDto,
  PaginationQueryDto,
  PaginatedMoviesResponseDto,
} from "./dto/movie.dto";
import { S3Service } from "../config/s3.service";

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    private readonly s3Service: S3Service
  ) {}

  async create(createMovieDto: CreateMovieDto): Promise<MovieResponseDto> {
    const movie = new this.movieModel(createMovieDto);
    const savedMovie = await movie.save();

    return await this.mapToResponseDto(savedMovie);
  }

  async findAll(
    query: PaginationQueryDto
  ): Promise<PaginatedMoviesResponseDto> {
    const { page = 1, limit, pageSize } = query;
    // Use pageSize if provided, otherwise use limit, default to 10
    const itemsPerPage = pageSize || limit || 10;
    const skip = (page - 1) * itemsPerPage;

    // Get total count
    const total = await this.movieModel.countDocuments();

    // Get paginated movies
    const movies = await this.movieModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage);

    const moviesWithSignedUrls = await Promise.all(
      movies.map(movie => this.mapToResponseDto(movie))
    );

    const totalPages = Math.ceil(total / itemsPerPage);

    return {
      data: moviesWithSignedUrls,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage,
        page,
        lastPage: totalPages,
        total,
        pageSize: itemsPerPage,
      },
    };
  }

  async findOne(id: string): Promise<MovieResponseDto> {
    const movie = await this.movieModel.findById(id);
    if (!movie) {
      throw new NotFoundException("Movie not found");
    }
    return await this.mapToResponseDto(movie);
  }

  async update(
    id: string,
    updateMovieDto: Partial<UpdateMovieDto>
  ): Promise<MovieResponseDto> {
    // Fetch current movie to know existing poster
    const existing = await this.movieModel.findById(id);
    if (!existing) {
      throw new NotFoundException("Movie not found");
    }

    const movie = await this.movieModel.findByIdAndUpdate(id, updateMovieDto, {
      new: true,
    });

    if (!movie) {
      throw new NotFoundException("Movie not found");
    }

    // If poster changed and there was a previous one, delete old S3 object
    if (updateMovieDto.poster && existing.poster) {
      // Only delete if the underlying S3 keys differ (i.e., a new file was uploaded)
      const oldKey = this.s3Service.extractKeyFromUrl(existing.poster);
      const newKey = this.s3Service.extractKeyFromUrl(updateMovieDto.poster);
      if (oldKey && newKey && oldKey !== newKey) {
        this.s3Service
          .deleteObject(oldKey)
          .catch(err =>
            console.error("Failed to delete old poster from S3:", err)
          );
      }
    }

    return await this.mapToResponseDto(movie);
  }

  async remove(id: string): Promise<void> {
    const movie = await this.movieModel.findByIdAndDelete(id);
    if (!movie) {
      throw new NotFoundException("Movie not found");
    }

    // Delete poster from S3 after DB deletion
    if (movie.poster) {
      const key = this.s3Service.extractKeyFromUrl(movie.poster);
      if (key) {
        await this.s3Service.deleteObject(key);
      }
    }
  }

  private async mapToResponseDto(
    movie: MovieDocument
  ): Promise<MovieResponseDto> {
    let signedPosterUrl: string | null = null;

    if (movie.poster) {
      console.log("Original poster URL:", movie.poster);
      const key = this.s3Service.extractKeyFromUrl(movie.poster);
      console.log("Extracted key:", key);
      if (key) {
        signedPosterUrl = await this.s3Service.generateSignedUrl(key);
        console.log("Generated signed URL:", signedPosterUrl);
      } else {
        console.log("Failed to extract key from URL");
      }
    } else {
      console.log("No poster URL found");
    }

    return {
      id: movie._id as string,
      title: movie.title,
      publishingYear: movie.publishingYear,
      poster: signedPosterUrl || movie.poster,
      createdAt: movie.createdAt as Date,
      updatedAt: movie.updatedAt as Date,
    };
  }
}
