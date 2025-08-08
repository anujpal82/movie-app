import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  Max,
  IsOptional,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMovieDto {
  @ApiProperty({ example: "Interstellar" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 2014, minimum: 1888 })
  @IsNumber()
  @Min(1888)
  @Max(new Date().getFullYear())
  @Transform(({ value }) => parseInt(value))
  publishingYear: number;

  @ApiPropertyOptional({ description: "S3 poster URL from multer-s3" })
  @IsString()
  @IsOptional()
  poster?: string; // S3 bucket URL
}

export class UpdateMovieDto {
  @ApiPropertyOptional({ example: "Interstellar (Extended)" })
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ example: 2015, minimum: 1888 })
  @IsNumber()
  @Min(1888)
  @Max(new Date().getFullYear())
  @Transform(({ value }) => parseInt(value))
  publishingYear: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  poster?: string;
}

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Page number (1-based)",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page (alternative to pageSize)",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: "Number of items per page (alternative to limit)",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class MovieResponseDto {
  @ApiProperty({ example: "64fd8a1b2c3d4e5f6a7b8c9d" })
  id: string;

  @ApiProperty({ example: "Interstellar" })
  title: string;

  @ApiProperty({ example: 2014 })
  publishingYear: number;

  @ApiProperty({
    example:
      "https://your-bucket.s3.amazonaws.com/posters/1234567890-interstellar.jpg",
    description: "Signed poster URL",
  })
  poster: string; // S3 bucket URL

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  updatedAt: Date;
}

export class PaginatedMoviesResponseDto {
  @ApiProperty({ type: [MovieResponseDto] })
  data: MovieResponseDto[];

  @ApiProperty({
    type: "object",
    properties: {
      currentPage: { type: "number", example: 1 },
      totalPages: { type: "number", example: 10 },
      totalItems: { type: "number", example: 100 },
      itemsPerPage: { type: "number", example: 10 },
      page: { type: "number", example: 1 },
      lastPage: { type: "number", example: 10 },
      total: { type: "number", example: 100 },
      pageSize: { type: "number", example: 10 },
    },
  })
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

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: "Bad Request" })
  message: string;

  @ApiProperty({ example: "Validation failed" })
  error: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: "Bad Request" })
  message: string;

  @ApiProperty({ example: "Validation failed" })
  error: string;

  @ApiProperty({
    example: [
      {
        field: "title",
        message: "title should not be empty",
      },
      {
        field: "publishingYear",
        message: "publishingYear must be a number",
      },
    ],
  })
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export class UnauthorizedResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: "Unauthorized" })
  message: string;

  @ApiProperty({ example: "Unauthorized" })
  error: string;
}

export class ForbiddenResponseDto {
  @ApiProperty({ example: 403 })
  statusCode: number;

  @ApiProperty({ example: "Forbidden" })
  message: string;

  @ApiProperty({ example: "Forbidden" })
  error: string;
}

export class NotFoundResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: "Movie not found" })
  message: string;

  @ApiProperty({ example: "Not Found" })
  error: string;
}

export class ConflictResponseDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: "Movie with this title already exists" })
  message: string;

  @ApiProperty({ example: "Conflict" })
  error: string;
}

export class InternalServerErrorResponseDto {
  @ApiProperty({ example: 500 })
  statusCode: number;

  @ApiProperty({ example: "Internal server error" })
  message: string;

  @ApiProperty({ example: "Internal Server Error" })
  error: string;
}

export class DeleteResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: "Movie deleted successfully" })
  message: string;
}
