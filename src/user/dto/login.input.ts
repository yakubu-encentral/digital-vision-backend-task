import { Field, InputType } from "@nestjs/graphql";
import { IsEmail } from "class-validator";

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: "Invalid email address" })
  email: string;

  @Field()
  password: string;
}
