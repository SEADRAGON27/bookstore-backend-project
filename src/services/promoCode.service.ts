/* eslint-disable prettier/prettier */
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PromoCodeEntity } from '../entities/promoCode.entity';
import { PromoCode } from '../dto/createPromoCode.dto';
import { UserEntity } from '../entities/user.entity';
import { CustomError } from '../interfaces/customError';
import QueryString from 'qs';
import { CheckPromoCode } from '../dto/checkPromoCode.dto';

export class PromoCodeService {
  constructor(private promoCodeRepository: Repository<PromoCodeEntity>) {}

  async createPromoCode(userId: string, createPromoCodeDto: PromoCode): Promise<PromoCodeEntity> {
    const promoCode = new PromoCodeEntity();
    Object.assign(promoCode, createPromoCodeDto);

    promoCode.user = userId as unknown as UserEntity;

    return await this.promoCodeRepository.save(promoCode);
  }

  async updatePromoCode(id: number, userId: string, updatePromoCodeDto: PromoCode): Promise<PromoCodeEntity> {
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

    this.addDiscountedPercent(query,queryBuilder);
    this.addMaxDiscount(query,queryBuilder);
    this.addIsActive(query,queryBuilder);
    this.addMaxDiscount(query,queryBuilder);
    this.addMinOrderAmount(query,queryBuilder);
    this.addExpiraionData(query,queryBuilder);

    const promoCodes = await queryBuilder.orderBy('createdAt', 'DESC').getMany();

    return promoCodes;
  }

  async addDiscountedPercent(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<PromoCodeEntity>) {
    if (query.discountedPercent) 
      queryBuilder.andWhere('promoCode.discountedPercent =:discountedPercent', { discountedPercent: query.discountedPrice });
    }
  
  async addIsActive(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<PromoCodeEntity>){
    if(query.isActive) queryBuilder.andWhere('promoCode.isActive =:isActive', { isActive: query.isActive });
  }

  async addMaxDiscount(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<PromoCodeEntity>){
    if (query.maxDiscount) queryBuilder.andWhere('promoCode.maxDiscount =:maxDiscount', { maxDiscount: query.maxDiscount });
  }

  async addMinOrderAmount(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<PromoCodeEntity>){
    if (query.minOrderAmount) 
      queryBuilder.andWhere('promoCode.minOrderAmount =:minOrderAmount', { minOrderAmount: query.minOrderAmount });
  }

  async addExpiraionData(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<PromoCodeEntity>){
    if (query.expiraionData) 
      queryBuilder.andWhere('DATE(promoCode.expirationData) =:expirationData', { expirationData: query.expirationData });
  }
}
