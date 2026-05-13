import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

class PrescriptionItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsString()
  @IsOptional()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];
}
