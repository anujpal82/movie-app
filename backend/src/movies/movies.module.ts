import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MoviesController } from "./movies.controller";
import { MoviesService } from "./movies.service";
import { Movie, MovieSchema } from "./schemas/movie.schema";
import { ConfigModule } from "@nestjs/config";
import { S3Service } from "../config/s3.service";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
  ],
  controllers: [MoviesController],
  providers: [MoviesService, S3Service],
  exports: [MoviesService],
})
export class MoviesModule {}
