import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LicensesService } from '../licenses/licenses.service';
import { PlansService } from '../plans/plans.service';
import { ValidateLicenseDto } from './dto/validate-license.dto';
import { LicenseStatus } from '../licenses/entities/license.entity';
import { UserStatus } from '../users/entities/user.entity';

@Injectable()
export class MtaService {
  constructor(
    private licensesService: LicensesService,
    private plansService: PlansService,
  ) {}

  async validateLicense(dto: ValidateLicenseDto) {
    const { license, identifier, server_ip, server_port } = dto;

    const licenseData = await this.licensesService.findByKey(license);
    if (!licenseData) throw new NotFoundException({ error: 'License not found.' });

    if (licenseData.status === LicenseStatus.BANNED) {
      throw new ForbiddenException({
        error: 'License has been banned.',
        reason: licenseData.status_reason || 'Violation of terms of service',
        contact: 'https://discord.gg/NQ79pWHJmP',
      });
    }
    if (licenseData.status === LicenseStatus.SUSPENDED) {
      throw new ForbiddenException({
        error: 'License is suspended.',
        reason: licenseData.status_reason || 'Contact support for more information',
        contact: 'https://discord.gg/NQ79pWHJmP',
      });
    }
    if (licenseData.status === LicenseStatus.INACTIVE) {
      throw new ForbiddenException({ error: 'License is inactive.' });
    }
    if (licenseData.user.status === UserStatus.BANNED) {
      throw new ForbiddenException({ error: 'User account has been banned.' });
    }
    if (licenseData.user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException({ error: 'User account is inactive.' });
    }

    const productId = parseInt(identifier, 10);
    if (isNaN(productId)) throw new NotFoundException({ error: 'Invalid product identifier.' });

    const hasIndividualAccess = this.licensesService.hasActiveProduct(licenseData, productId);
    let hasViaPlan = false;
    if (!hasIndividualAccess) hasViaPlan = await this.plansService.hasProductViaPlan(licenseData.user_id, productId);
    if (!hasIndividualAccess && !hasViaPlan) throw new NotFoundException({ error: 'Product not found in license.' });

    await this.licensesService.updateLastUsed(licenseData.id);

    return {
      server: {
        ip: licenseData.authorized_ip || server_ip || '',
        port: String(licenseData.authorized_port || server_port || ''),
      },
      resource: identifier,
      discord: licenseData.user.discord_id,
      access_type: hasIndividualAccess ? 'individual' : 'plan',
    };
  }
}
