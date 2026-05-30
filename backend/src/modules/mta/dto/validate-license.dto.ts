import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateLicenseDto {
  @ApiProperty({ example: 'WS-LK3M9X-A1B2C3D4E5F6G7H8-F3A9B2' })
  @IsString() @IsNotEmpty() license: string;

  @ApiProperty({ example: '4', description: 'ID del producto como string' })
  @IsString() @IsNotEmpty() identifier: string;

  @ApiProperty({ example: '192.168.1.100', required: false })
  @IsOptional() @IsString() server_ip?: string;

  @ApiProperty({ example: '22003', required: false })
  @IsOptional() @IsString() server_port?: string;
}
