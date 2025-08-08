import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { HealthResponseDto } from "./health/health.dto";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @ApiOperation({ summary: "Health check" })
  @ApiResponse({ status: 200, type: HealthResponseDto })
  health(): HealthResponseDto {
    return {
      status: "ok",
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get("hello")
  @ApiOperation({ summary: "Hello endpoint" })
  @ApiResponse({ status: 200, description: "Simple hello", type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
