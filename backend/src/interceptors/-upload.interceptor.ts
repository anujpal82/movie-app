// src/common/interceptors/poster-upload.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

@Injectable()
export class PosterUploadInterceptor implements NestInterceptor {
  private readonly interceptor: NestInterceptor;

  constructor(private readonly configService: ConfigService) {
    const s3 = new S3Client({
      region: this.configService.get<string>("s3.region")!,
      credentials: {
        accessKeyId: this.configService.get<string>("s3.accessKeyId")!,
        secretAccessKey: this.configService.get<string>("s3.secretAccessKey")!,
      },
    });

    this.interceptor = new (FileInterceptor("poster", {
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
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }))();
  }

  async intercept(context: ExecutionContext, next: CallHandler) {
    return this.interceptor.intercept(context, next);
  }
}
