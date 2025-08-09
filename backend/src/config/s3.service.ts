import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>("s3.region")!;
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>("s3.accessKeyId")!,
        secretAccessKey: this.configService.get<string>("s3.secretAccessKey")!,
      },
    });
    this.bucket = this.configService.get<string>("s3.bucket")!;
  }

  async generateSignedUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    if (!key) {
      console.log("No key provided for signed URL generation");
      return null;
    }

    try {
      console.log(
        "Generating signed URL for key:",
        key,
        "bucket:",
        this.bucket
      );
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });
      console.log("Successfully generated signed URL:", signedUrl);
      return signedUrl;
    } catch (error) {
      console.error(
        "Error generating signed URL for key:",
        key,
        "error:",
        error
      );
      return null;
    }
  }

  async generateSignedUrls(
    keys: string[],
    expiresIn: number = 3600
  ): Promise<(string | null)[]> {
    if (!keys || keys.length === 0) {
      return [];
    }

    const signedUrlPromises = keys.map(key =>
      this.generateSignedUrl(key, expiresIn)
    );
    return Promise.all(signedUrlPromises);
  }

  async deleteObject(key: string): Promise<void> {
    if (!key) {
      console.log("No key provided for deletion");
      return;
    }

    try {
      console.log("Deleting S3 object:", key);
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      console.log("Successfully deleted S3 object:", key);
    } catch (error) {
      console.error("Error deleting S3 object:", key, "error:", error);
    }
  }

  extractKeyFromUrl(urlOrKey: string): string | null {
    if (!urlOrKey) {
      console.log("No URL provided for key extraction");
      return null;
    }

    try {
      // If it's not a URL (no scheme), assume it's already a key
      if (!/^https?:\/\//i.test(urlOrKey)) {
        return urlOrKey;
      }

      console.log("Extracting key from URL:", urlOrKey);
      const urlObj = new URL(urlOrKey);
      const host = urlObj.hostname.toLowerCase();
      const path = urlObj.pathname;
      const bucketName = this.bucket.toLowerCase();
      const regionHostPrefix = `s3.${this.region.toLowerCase()}.amazonaws.com`;

      // Only treat URL as our S3 if the host matches our bucket (virtual-hosted)
      // or is S3 path-style with our bucket as first path segment.
      const isVirtualHosted = host.startsWith(`${bucketName}.s3.`);
      const isAwsS3Host =
        host === "s3.amazonaws.com" ||
        host === regionHostPrefix ||
        host.startsWith("s3.");
      const isPathStyle = isAwsS3Host && path.startsWith(`/${bucketName}/`);

      if (!isVirtualHosted && !isPathStyle) {
        // External/non-bucket URL → do not attempt key extraction/signing
        console.log(
          "URL does not belong to configured S3 bucket; skipping key extraction"
        );
        return null;
      }

      // Handle common S3 URL formats, then decode to raw S3 key
      let key = path;
      if (key.startsWith("/")) key = key.substring(1);
      if (isPathStyle && key.startsWith(bucketName + "/")) {
        key = key.substring(bucketName.length + 1);
      }

      if (!key) {
        console.log("Empty key extracted from URL");
        return null;
      }

      // IMPORTANT: decode URL-encoded characters so the SDK receives the real S3 key
      // e.g. "%20" -> space; avoids double-encoding to "%2520" in presigned URL
      const decodedKey = decodeURIComponent(key);
      console.log("Successfully extracted key:", decodedKey);
      return decodedKey;
    } catch (error) {
      console.error(
        "Error extracting key from URL:",
        urlOrKey,
        "error:",
        error
      );
      return null;
    }
  }
}
