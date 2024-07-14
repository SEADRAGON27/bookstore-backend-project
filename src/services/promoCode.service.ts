import { Repository } from 'typeorm';
import { PromoCodeEntity } from '../entities/promocode.entity';
import { createPromoCode } from '../dto/createPromoCode.dto';
import { UserEntity } from '../entities/user.entity';
import { CustomError } from '../interfaces/customError';
import QueryString from 'qs';
import { CheckPromoCode } from '../dto/checkPromoCode.dto';
import { updatePromoCode } from '../dto/updatePromCode.dto';

export class PromoCodeService {
  constructor(
    private promoCodeRepository: Repository<PromoCodeEntity>,
    private userRepository: Repository<UserEntity>,
  ) {}

  async createPromoCode(userId: number, createPromoCodeDto: createPromoCode): Promise<PromoCodeEntity> {
    const promoCode = new PromoCodeEntity();
    Object.assign(promoCode, createPromoCodeDto);

    promoCode.user = await this.userRepository.findOneBy({ id: userId });

    return await this.promoCodeRepository.save(promoCode);
  }

  async updatePromoCode(id: number, updatePromoCodeDto: updatePromoCode): Promise<PromoCodeEntity> {
    const promoCode = await this.promoCodeRepository.findOneBy({ id });

    if (!promoCode) throw new CustomError(404, "Promo code doesn't exit.");

    Object.assign(promoCode, updatePromoCodeDto);

    return await this.promoCodeRepository.save(promoCode);
  }

  async deletePromoCode(id: number): Promise<void> {
    const promoCode = await this.promoCodeRepository.findOneBy({ id });

    if (!promoCode) throw new CustomError(404, "Promo code doesn't exist.");

    await this.promoCodeRepository.delete({ id });
  }

  async checkPromoCode(checkPromoCodeDto: CheckPromoCode): Promise<{ discountedAmount: number; discount: number }> {
    const validPromoCode = await this.promoCodeRepository.findOne({ where: { code: checkPromoCodeDto.code, is_active: true } });

    if (!validPromoCode) throw new CustomError(403, 'Promo code is unvalid.');

    if (validPromoCode.expiration_date && validPromoCode.expiration_date < new Date()) throw new CustomError(403, 'Promo code has expired');

    if (validPromoCode.min_order_amount && checkPromoCodeDto.amount < validPromoCode.min_order_amount) throw new CustomError(403, `Minimum order amount for this promotional code: ${validPromoCode.min_order_amount}`);

    let discount = (checkPromoCodeDto.amount * validPromoCode.discount_percent) / 100;

    if (validPromoCode.max_discount && discount > validPromoCode.max_discount) {
      discount = validPromoCode.max_discount;
    }

    const discountedAmount = checkPromoCodeDto.amount - discount;

    return { discountedAmount, discount };
  }

  async findAll(query: QueryString.ParsedQs): Promise<PromoCodeEntity[]> {
    const queryBuilder = this.promoCodeRepository.createQueryBuilder('promoCode');

    if (query.discountedPercent) queryBuilder.andWhere('promoCode.discounted_percent =:discountedPercent', { discountedPercent: query.discountedPrice });

    if (query.isActive) queryBuilder.andWhere('promoCode.is_active =:isActive', { isActive: query.isActive });

    if (query.maxDiscount) queryBuilder.andWhere('promoCode.max_discount =:maxDiscount', { maxDiscount: query.maxDiscount });

    if (query.minOrderAmount) queryBuilder.andWhere('promoCode.min_order_amount =:minOrderAmount', { minOrderAmount: query.minOrderAmount });

    if (query.expiraionData) queryBuilder.andWhere('DATE(promoCode.expiration_data) =:expirationData', { expirationData: query.expirationData });

    const promoCodes = await queryBuilder.orderBy('created_at', 'DESC').getMany();

    return promoCodes;
  }
}
