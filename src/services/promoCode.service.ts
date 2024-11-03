import { Repository, SelectQueryBuilder } from 'typeorm';
import { PromoCodeEntity } from '../entities/promoCode.entity';
import { CreatePromoCodeDto } from '../dto/createPromoCode.dto';
import { UserEntity } from '../entities/user.entity';
import { CustomError } from '../interfaces/customError';
import QueryString from 'qs';
import { CheckPromoCode } from '../dto/checkPromoCode.dto';
import { UpdatePromoCodeDto } from '../dto/updatePromoCode.dto';

export class PromoCodeService {
  constructor(
    private readonly promoCodeRepository: Repository<PromoCodeEntity>,
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createPromoCode(userId: string, createPromoCodeDto: CreatePromoCodeDto): Promise<PromoCodeEntity> {
    const promoCode = await this.promoCodeRepository.findOneBy({ code: createPromoCodeDto.code });

    if (promoCode) throw new CustomError(404, 'Promo code is taken');

    const createPromoCode = new PromoCodeEntity();

    Object.assign(createPromoCode, createPromoCodeDto);

    createPromoCode.user = await this.userRepository.findOneBy({ id: userId });

    return await this.promoCodeRepository.save(createPromoCode);
  }

  async updatePromoCode(id: number, userId: string, updatePromoCodeDto: UpdatePromoCodeDto): Promise<PromoCodeEntity> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!promoCode) throw new CustomError(404, "Promo code doesn't exit.");

    promoCode.user.id = userId;
    Object.assign(promoCode, updatePromoCodeDto);

    return await this.promoCodeRepository.save(promoCode);
  }

  async deletePromoCode(id: number) {
    const promoCode = await this.promoCodeRepository.findOneBy({ id });

    if (!promoCode) throw new CustomError(404, "Promo code doesn't exist.");

    await this.promoCodeRepository.delete({ id });
  }

  async checkPromoCode(checkPromoCodeDto: CheckPromoCode): Promise<{ totalSum: number }> {
    const validPromoCode = await this.promoCodeRepository.findOne({ where: { code: checkPromoCodeDto.code, isActive: true } });

    if (!validPromoCode) throw new CustomError(403, 'Promo code is unvalid.');

    if (validPromoCode.expirationDate && validPromoCode.expirationDate < new Date()) throw new CustomError(403, 'Promo code has expired');

    if (validPromoCode.minOrderAmount && checkPromoCodeDto.totalSum < validPromoCode.minOrderAmount) throw new CustomError(403, `Minimum order amount for this promotional code: ${validPromoCode.minOrderAmount}`);

    let discount = (checkPromoCodeDto.totalSum * validPromoCode.discountPercent) / 100;

    if (validPromoCode.maxDiscount && discount > validPromoCode.maxDiscount) {
      discount = validPromoCode.maxDiscount;
    }

    const totalSum = checkPromoCodeDto.totalSum - discount;

    return { totalSum };
  }

  async findAll(query: QueryString.ParsedQs): Promise<PromoCodeEntity[]> {
    const queryBuilder = this.promoCodeRepository.createQueryBuilder('promoCode');

    this.addDiscountedPercent(query, queryBuilder);
    this.addMaxDiscount(query, queryBuilder);
    this.addIsActive(query, queryBuilder);
    this.addMaxDiscount(query, queryBuilder);
    this.addMinOrderAmount(query, queryBuilder);
    this.addExpiraionData(query, queryBuilder);

    const promoCodes = await queryBuilder.orderBy('createdAt', 'DESC').getMany();

    return promoCodes;
  }

  async addDiscountedPercent(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<PromoCodeEntity>) {
    if (query.discountedPercent) queryBuilder.andWhere('promoCode.discountedPercent =:discountedPercent', { discountedPercent: query.discountedPrice });
  }

  async addIsActive(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<PromoCodeEntity>) {
    if (query.isActive) queryBuilder.andWhere('promoCode.isActive =:isActive', { isActive: query.isActive });
  }

  async addMaxDiscount(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<PromoCodeEntity>) {
    if (query.maxDiscount) queryBuilder.andWhere('promoCode.maxDiscount =:maxDiscount', { maxDiscount: query.maxDiscount });
  }

  async addMinOrderAmount(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<PromoCodeEntity>) {
    if (query.minOrderAmount) queryBuilder.andWhere('promoCode.minOrderAmount =:minOrderAmount', { minOrderAmount: query.minOrderAmount });
  }

  async addExpiraionData(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<PromoCodeEntity>) {
    if (query.expiraionData) queryBuilder.andWhere('DATE(promoCode.expirationData) =:expirationData', { expirationData: query.expirationData });
  }
}
