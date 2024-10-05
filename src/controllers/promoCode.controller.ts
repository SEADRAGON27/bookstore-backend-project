import { NextFunction, Response, Request } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { PromoCodeService } from '../services/promoCode.service';
import { WinstonLoggerService } from '../logs/logger';
import { exceptionType } from '../utils/exceptionType';

export class PromoCodeController {
  constructor(
    private promoCodeService: PromoCodeService,
    private logger: WinstonLoggerService,
  ) {}

  async createPromoCode(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;

    try {
      const createPromoCodeDto = req.body;

      const promoCode = await this.promoCodeService.createPromoCode(userId, createPromoCodeDto);

      res.status(201).json(promoCode);

      this.logger.log(`Promo code created successfully. User ID: ${userId}, Promo Code Data: ${JSON.stringify(createPromoCodeDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error creating promo code. User ID: ${userId}, Error: ${error.message}`);

      next(error);
    }
  }

  async checkPromoCode(req: Request, res: Response, next: NextFunction) {
    try {
      const checkPromoCodeDto = req.body;

      const result = await this.promoCodeService.checkPromoCode(checkPromoCodeDto);

      res.status(200).json(result);

      this.logger.log(`Promo code checked successfully. Promo Code Data: ${JSON.stringify(checkPromoCodeDto)}`);
    } catch (error) {
      this.logger.error(`Error checking promo code. Error: ${error.message}`);
      next(error);
    }
  }

  async deletePromoCode(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.params.id as unknown as number;

    try {
      await this.promoCodeService.deletePromoCode(id);

      res.status(200).json({ message: 'Promo code deleted successfully' });

      this.logger.log(`Promo code deleted successfully. Promo Code ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error deleting promo code. Promo Code ID: ${id}, Error: ${error.message}`);

      next(error);
    }
  }

  async updatePromoCode(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.params.id as unknown as number;

    try {
      const userId = req.user.id;
      const updatePromoCodeDto = req.body;

      const promoCode = await this.promoCodeService.updatePromoCode(id, userId, updatePromoCodeDto);

      res.status(200).json(promoCode);

      this.logger.log(`Promo code updated successfully. Promo Code ID: ${id}, Updated Data: ${JSON.stringify(updatePromoCodeDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error updating promo code. Promo Code ID: ${id}, Error: ${error.message}`);

      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;

      const promoCodes = await this.promoCodeService.findAll(query);

      res.status(200).json(promoCodes);
      this.logger.log(`Promo codes fetched successfully. Query: ${JSON.stringify(query)}`);
    } catch (error) {
      this.logger.error(`Error fetching promo codes. Error: ${error.message}`);
      next(error);
    }
  }
}
