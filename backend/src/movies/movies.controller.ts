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
  @ApiOperation({ summary: "Create a movie" })
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
          description: "Poster image file",
        },
      },
      required: ["title", "publishingYear"],
    },
  })
  @ApiResponse({ status: 201, type: MovieResponseDto })
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFile() file: Express.Multer.File & { location?: string }
  ): Promise<MovieResponseDto> {
    return this.moviesService.create({
      ...createMovieDto,
      poster: file?.location,
    });
  }
  @Get()
  @ApiOperation({ summary: "List movies with pagination" })
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
  @ApiResponse({ status: 200, type: PaginatedMoviesResponseDto })
  async findAll(
    @Query() query: PaginationQueryDto
  ): Promise<PaginatedMoviesResponseDto> {
    return this.moviesService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get movie by id" })
  @ApiResponse({ status: 200, type: MovieResponseDto })
  async findOne(@Param("id") id: string): Promise<MovieResponseDto> {
    return this.moviesService.findOne(id);
  }

  @Patch(":id")
  @UseInterceptors(PosterUploadInterceptor)
  @ApiOperation({ summary: "Update a movie" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: { type: "string", example: "Interstellar (Extended)" },
        publishingYear: { type: "number", example: 2015 },
        poster: { type: "string", format: "binary" },
      },
    },
  })
  @ApiResponse({ status: 200, type: MovieResponseDto })
  async update(
    @Param("id") id: string,
    @Body() updateMovieDto: UpdateMovieDto,
    @UploadedFile() file?: Express.Multer.File & { location?: string }
  ): Promise<MovieResponseDto> {
    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updateMovieDto)) {
      if (value !== undefined) {
        updateData[key] = value as unknown;
      }
    }

    if (file?.location) {
      updateData.poster = file.location;
    }

    return this.moviesService.update(id, updateData);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a movie" })
  @ApiResponse({ status: 200, description: "Movie deleted" })
  async remove(@Param("id") id: string): Promise<void> {
    return this.moviesService.remove(id);
  }
}
