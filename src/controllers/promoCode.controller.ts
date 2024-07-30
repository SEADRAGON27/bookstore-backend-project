import { NextFunction, Response, Request } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { PromoCodeService } from '../services/promoCode.service';
import { logger } from '../logs/logger';

export class PromoCodeController {
  constructor(private promoCodeService: PromoCodeService) {}

  async createPromoCode(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const createPromoCodeDto = req.body;

      const promoCode = await this.promoCodeService.createPromoCode(userId, createPromoCodeDto);

      res.status(201).json(promoCode);
      logger.info({ userId, createPromoCodeDto }, 'Creating a new promo code successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error creating promo code');
      next(error);
    
    
    }
  }

  async checkPromoCode(req: Request, res: Response, next: NextFunction) {
    try {
      const checkPromoCodeDto = req.body;

      const result = await this.promoCodeService.checkPromoCode(checkPromoCodeDto);

      res.status(200).json(result);
      logger.info({ checkPromoCodeDto }, 'Checking promo code succesfully');
    
    } catch (error) {
      
      logger.error(error, 'Error checking promo code');
      next(error);
    
    }
  }

  async deletePromoCode(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as unknown as number;

      await this.promoCodeService.deletePromoCode(id);

      res.status(200).json({ message: 'Order is deleted' });
      logger.info({ id }, 'Deleting promo code successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error deleting promo code');
      next(error);
    
    }
  }

  async updatePromoCode(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as unknown as number;
      const userId = req.user.id; 
      const updatePromoCodeDto = req.body;

      const order = await this.promoCodeService.updatePromoCode(id, userId,updatePromoCodeDto);

      res.status(200).json(order);
      logger.info({ id, updatePromoCodeDto }, 'Updating promo code successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error updating promo code');
      next(error);
    
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;

      const orders = await this.promoCodeService.findAll(query);

      res.status(200).json(orders);
      logger.info({ query }, 'Fetching all promo codes');
    
    } catch (error) {
      
      logger.error(error, 'Error fetching all promo codes');
      next(error);
    
    }
  }
}
