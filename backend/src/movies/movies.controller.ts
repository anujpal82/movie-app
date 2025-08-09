import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MoviesService } from "./movies.service";
import {
  CreateMovieDto,
  UpdateMovieDto,
  MovieResponseDto,
  PaginationQueryDto,
  PaginatedMoviesResponseDto,
  ValidationErrorResponseDto,
  UnauthorizedResponseDto,
  ForbiddenResponseDto,
  NotFoundResponseDto,
  ConflictResponseDto,
  InternalServerErrorResponseDto,
  DeleteResponseDto,
} from "./dto/movie.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import { PosterUploadInterceptor } from "src/interceptors/-upload.interceptor";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";

@ApiTags("movies")
@ApiBearerAuth()
@Controller("movies")
@UseGuards(JwtAuthGuard)
export class MoviesController {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    private readonly moviesService: MoviesService,
    private readonly configService: ConfigService
  ) {}
  private createPosterInterceptor() {
    const s3 = new S3Client({
      region: this.configService.get<string>("s3.region")!,
      credentials: {
        accessKeyId: this.configService.get<string>("s3.accessKeyId")!,
        secretAccessKey: this.configService.get<string>("s3.secretAccessKey")!,
      },
    });

    return FileInterceptor("poster", {
      storage: multerS3({
        s3,
        bucket: this.configService.get<string>("s3.bucket")!,
        // acl: "public-read",
        key: (req, file, cb) => {
          cb(null, `posters/${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Only image files are allowed!"), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    });
  }
  @Post()
  @UseInterceptors(PosterUploadInterceptor)
  @ApiOperation({
    summary: "Create a movie",
    description:
      "Creates a new movie with title, publishing year, and optional poster",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: { type: "string", example: "Interstellar" },
        publishingYear: { type: "number", example: 2014 },
        poster: {
          type: "string",
          format: "binary",
          description: "Poster image file (max 5MB)",
        },
      },
      required: ["title", "publishingYear"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Movie created successfully",
    type: MovieResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden",
    type: ForbiddenResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Movie with this title already exists",
    type: ConflictResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: InternalServerErrorResponseDto,
  })
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFile() file: Express.Multer.File & { location?: string }
  ): Promise<MovieResponseDto> {
    // Accept either uploaded file location or a provided URL in body
    return this.moviesService.create({
      ...createMovieDto,
      poster: file?.location ?? createMovieDto.poster,
    });
  }
  @Get()
  @ApiOperation({
    summary: "List movies with pagination",
    description: "Retrieves a paginated list of movies with optional filtering",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (1-based)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (1-100) - alternative to pageSize",
    example: 10,
  })
  @ApiQuery({
    name: "pageSize",
    required: false,
    type: Number,
    description: "Items per page (1-100) - alternative to limit",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: "Movies retrieved successfully",
    type: PaginatedMoviesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden",
    type: ForbiddenResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: InternalServerErrorResponseDto,
  })
  async findAll(
    @Query() query: PaginationQueryDto
  ): Promise<PaginatedMoviesResponseDto> {
    return this.moviesService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get movie by id",
    description: "Retrieves a specific movie by its unique identifier",
  })
  @ApiParam({
    name: "id",
    description: "Movie ID",
    example: "64fd8a1b2c3d4e5f6a7b8c9d",
  })
  @ApiResponse({
    status: 200,
    description: "Movie retrieved successfully",
    type: MovieResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid ID format",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden",
    type: ForbiddenResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Movie not found",
    type: NotFoundResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: InternalServerErrorResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<MovieResponseDto> {
    return this.moviesService.findOne(id);
  }

  @Patch(":id")
  @UseInterceptors(PosterUploadInterceptor)
  @ApiOperation({
    summary: "Update a movie",
    description: "Updates an existing movie with new data and optional poster",
  })
  @ApiParam({
    name: "id",
    description: "Movie ID",
    example: "64fd8a1b2c3d4e5f6a7b8c9d",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: { type: "string", example: "Interstellar (Extended)" },
        publishingYear: { type: "number", example: 2015 },
        poster: {
          type: "string",
          format: "binary",
          description: "Poster image file (max 5MB)",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Movie updated successfully",
    type: MovieResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden",
    type: ForbiddenResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Movie not found",
    type: NotFoundResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Movie with this title already exists",
    type: ConflictResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: InternalServerErrorResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateMovieDto: UpdateMovieDto,
    @UploadedFile() file?: Express.Multer.File & { location?: string }
  ): Promise<MovieResponseDto> {
    const updateData: Record<string, unknown> = {};

    // Copy all updatable fields except poster (we'll handle it explicitly)
    for (const [key, value] of Object.entries(updateMovieDto)) {
      if (value !== undefined && key !== "poster") {
        updateData[key] = value as unknown;
      }
    }

    // Determine new poster from either uploaded file or a provided URL
    const newPoster: string | undefined =
      file?.location ?? updateMovieDto.poster;
    if (typeof newPoster === "string") {
      updateData.poster = newPoster;
    }

    return this.moviesService.update(id, updateData);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete a movie",
    description: "Permanently deletes a movie by its ID",
  })
  @ApiParam({
    name: "id",
    description: "Movie ID",
    example: "64fd8a1b2c3d4e5f6a7b8c9d",
  })
  @ApiResponse({
    status: 200,
    description: "Movie deleted successfully",
    type: DeleteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid ID format",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden",
    type: ForbiddenResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Movie not found",
    type: NotFoundResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: InternalServerErrorResponseDto,
  })
  async remove(@Param("id") id: string): Promise<void> {
    return this.moviesService.remove(id);
  }
}
