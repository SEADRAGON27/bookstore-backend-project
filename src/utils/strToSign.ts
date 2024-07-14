import crypto from 'crypto';

export function str_to_sign(str: string) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(str);

  return sha1.digest('base64');
}
