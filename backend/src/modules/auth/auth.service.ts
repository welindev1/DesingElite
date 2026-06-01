import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { User, UserStatus } from '../users/entities/user.entity';
import { License, LicenseStatus } from '../licenses/entities/license.entity';
import { generateLicenseKey } from '../../common/utils/license-generator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(License) private licensesRepo: Repository<License>,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async checkGuildMembership(accessToken: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://discord.com/api/users/@me/guilds', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      const guildId = this.configService.get<string>('DISCORD_GUILD_ID');
      const guilds = response.data;
      this.logger.log(`User guilds: ${guilds.map((g: any) => g.id).join(', ')}`);
      this.logger.log(`Looking for guild: ${guildId}`);
      const isMember = guilds.some((guild: any) => guild.id === guildId);
      this.logger.log(`Is member: ${isMember}`);
      return isMember;
    } catch (error: any) {
      if (error.response?.status === 429) {
        this.logger.warn('Discord rate limit - permitiendo acceso temporalmente');
        return true; // Permitir acceso cuando hay rate limit
      }
      this.logger.error('Error checking guild membership', error.message);
      return false;
    }
  }

  async handleDiscordLogin(profile: any, ipAddress?: string) {
    const { id: discordId, username, email, avatar, accessToken } = profile;

    const isMember = await this.checkGuildMembership(accessToken);
    if (!isMember) {
      throw new ForbiddenException({
        message: 'Debes ser miembro del servidor de Discord de DisenosElite.',
        invite_url: 'https://discord.gg/DisenosElite',
      });
    }

    let user = await this.usersRepo.findOne({ where: { discord_id: discordId } });
    let isNew = false;

    if (!user) {
      user = await this.usersRepo.save(this.usersRepo.create({
        discord_id: discordId, username, email: email || null,
        avatar: avatar ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png` : null,
        ip_address: ipAddress || null, status: UserStatus.ACTIVE,
      }));
      await this.licensesRepo.save(this.licensesRepo.create({
        user_id: user.id, license_key: generateLicenseKey(user.id),
        products: [], status: LicenseStatus.ACTIVE,
      }));
      isNew = true;
      this.logger.log(`New user registered: ${username} (${discordId})`);
    } else {
      user.username = username;
      user.email = email || user.email;
      user.avatar = avatar ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png` : user.avatar;
      user.ip_address = ipAddress || user.ip_address;
      user.last_login = new Date();
      await this.usersRepo.save(user);
    }

    const access_token = this.jwtService.sign({ sub: Number(user.id), discord_id: user.discord_id, username: user.username });
    return { access_token, user, isNew };
  }
}
