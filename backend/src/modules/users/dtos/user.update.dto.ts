import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { UserRoles } from "../../../common/guards/user-role.guard";

export class UserUpdate{
    @IsString()
    @MinLength(3)
    @IsOptional()
    fullName?: string

    @IsOptional()
    @IsEnum(UserRoles)
    role?: UserRoles
}