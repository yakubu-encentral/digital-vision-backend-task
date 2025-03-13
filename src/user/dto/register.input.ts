import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsOptional, IsStrongPassword } from "class-validator";

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail({}, { message: "Invalid email address" })
  email: string;

  @Field()
  @IsStrongPassword()
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  biometricKey?: string;
}
