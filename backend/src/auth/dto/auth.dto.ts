import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "jane@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: "jane@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: "Jane Doe" })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  accessToken: string;

  @ApiProperty({
    example: { id: "64fd...", email: "jane@example.com", name: "Jane" },
  })
  user: {
    id: string;
    email: string;
    name: string;
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
        field: "email",
        message: "email must be an email",
      },
      {
        field: "password",
        message: "password should not be empty",
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

export class ConflictResponseDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: "User already exists" })
  message: string;

  @ApiProperty({ example: "Conflict" })
  error: string;
}
