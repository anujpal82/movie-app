import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  ErrorResponseDto,
  ValidationErrorResponseDto,
  UnauthorizedResponseDto,
  ConflictResponseDto,
  // Removed InternalServerErrorResponseDto because it is not exported from "./dto/auth.dto"
} from "./dto/auth.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({
    summary: "Register a new user",
    description: "Creates a new user account with email, password, and name",
  })
  @ApiResponse({
    status: 201,
    description: "User registered successfully",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "User already exists",
    type: ConflictResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ErrorResponseDto,
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login and receive JWT",
    description:
      "Authenticates user with email and password, returns JWT token",
  })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ErrorResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}
