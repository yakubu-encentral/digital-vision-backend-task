import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail({}, { message: "Invalid email address" })
  email: string;

  @Field()
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  biometricKey?: string;
}
