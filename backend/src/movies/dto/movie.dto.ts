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
  @ApiProperty()
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  publishingYear: number;
  @ApiProperty({ description: "Signed poster URL" })
  poster: string; // S3 bucket URL
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
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
