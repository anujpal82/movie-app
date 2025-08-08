import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type MovieDocument = Movie & Document;

@Schema({ timestamps: true })
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  publishingYear: number;

  @Prop({ required: true })
  poster: string; // S3 bucket URL

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
