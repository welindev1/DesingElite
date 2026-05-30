import { Controller, Get, Post, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SkipTransform } from '../../common/decorators/skip-transform.decorator';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService) {}

  @Public() @SkipTransform() @Get('discord') @UseGuards(AuthGuard('discord'))
  @ApiOperation({ summary: 'Iniciar login con Discord — redirige a OAuth' })
  async discordAuth() {}

  @Public() @SkipTransform() @Get('discord/callback') @UseGuards(AuthGuard('discord'))
  @ApiOperation({ summary: 'Callback OAuth — verifica membresía, crea usuario + licencia si es nuevo, retorna JWT' })
  async discordCallback(@Req() req: Request, @Res() res: Response) {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:5173');
    try {
      const profile = req.user as any;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
      const { access_token, isNew } = await this.authService.handleDiscordLogin(profile, ipAddress);
      return res.redirect(`${appUrl}/auth/discord/callback?token=${access_token}&isNew=${isNew}`);
    } catch (error) {
      const errorMessage = encodeURIComponent(error.message || 'Error al iniciar sesión');
      return res.redirect(`${appUrl}/auth/discord/callback?error=${errorMessage}`);
    }
  }

  @Get('me') @UseGuards(JwtAuthGuard) @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Obtener usuario autenticado actual' })
  async getMe(@CurrentUser() user: User) {
    console.log('[getMe] user.role =', JSON.stringify(user.role), '| user.id =', user.id, '| typeof role =', typeof user.role);
    return user;
  }

  @Post('logout') @UseGuards(JwtAuthGuard) @ApiBearerAuth('JWT') @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout — el cliente debe eliminar el token' })
  async logout() { return { message: 'Logged out successfully' }; }
}
