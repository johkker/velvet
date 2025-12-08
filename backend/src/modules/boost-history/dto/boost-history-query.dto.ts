import { IsOptional, IsInt, Min } from 'class-validator';

export class BoostHistoryQueryDto {
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number = 20;

    @IsInt()
    @Min(0)
    @IsOptional()
    offset?: number = 0;
}
