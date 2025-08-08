import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { HealthResponseDto } from "./health/health.dto";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @ApiOperation({
    summary: "Health check",
    description:
      "Returns the health status of the application including uptime and timestamp",
  })
  @ApiResponse({
    status: 200,
    description: "Application is healthy",
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: "Application is unhealthy",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "error" },
        message: { type: "string", example: "Service unavailable" },
        timestamp: { type: "string", example: "2024-01-15T10:30:00.000Z" },
      },
    },
  })
  health(): HealthResponseDto {
    return {
      status: "ok",
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get("hello")
  @ApiOperation({
    summary: "Hello endpoint",
    description: "Simple hello endpoint for testing API connectivity",
  })
  @ApiResponse({
    status: 200,
    description: "Hello message returned successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Hello World!" },
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
