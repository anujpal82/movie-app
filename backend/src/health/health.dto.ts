import { ApiProperty } from "@nestjs/swagger";

export class HealthResponseDto {
  @ApiProperty({ example: "ok" })
  status: string;

  @ApiProperty({ description: "Process uptime in seconds", example: 123.45 })
  uptimeSeconds: number;

  @ApiProperty({
    description: "ISO timestamp of the health check",
    example: "2025-08-08T03:30:00.000Z",
  })
  timestamp: string;
}
