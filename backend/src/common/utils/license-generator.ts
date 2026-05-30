import * as crypto from 'crypto';

export function generateLicenseKey(userId: number): string {
  const prefix = process.env.LICENSE_PREFIX || 'WS';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(5).toString('hex').toUpperCase();
  const userHash = crypto
    .createHash('md5')
    .update(userId.toString())
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();
  return `${prefix}-${timestamp}-${random}-${userHash}`;
}
