import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';

@Injectable()
export class BotAuthGuard implements CanActivate {
  private readonly logger = new Logger(BotAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const botSecret = request.headers['x-bot-secret'];
    const expectedSecret = process.env.BOT_API_SECRET;

    this.logger.warn(`[BOT AUTH] Received: "${botSecret || 'null'}"`);
    this.logger.warn(`[BOT AUTH] Expected: "${expectedSecret || 'null'}"`);

    if (!botSecret || botSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid bot secret');
    }
    return true;
  }
}
