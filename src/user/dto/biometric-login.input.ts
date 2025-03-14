import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class BiometricLoginInput {
  @Field()
  @IsString()
  biometricKey: string;
}
