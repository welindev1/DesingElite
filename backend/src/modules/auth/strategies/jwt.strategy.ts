import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number | string; discord_id: string }) {
    console.log('[JWT] payload.sub =', payload.sub, '| type =', typeof payload.sub);
    const user = await this.usersService.findById(Number(payload.sub));
    console.log('[JWT] user found =', user ? `${user.id} (${typeof user.id})` : 'NULL');
    if (!user) throw new UnauthorizedException('User not found');
    if (user.status === 'banned') throw new UnauthorizedException('User is banned');
    return user;
  }
}
