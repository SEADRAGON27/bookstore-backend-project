import { NextFunction, Response, Request } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { PromoCodeService } from '../services/promoCode.service';
import { exceptionType } from '../utils/exceptionType';
import { Log } from '../decorators/log.decorator';

export class PromoCodeController {
  constructor(private promoCodeService: PromoCodeService) {}

  @Log({ body: true, user: true })
  async createPromoCode(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;

    const createPromoCodeDto = req.body;

    const promoCode = await this.promoCodeService.createPromoCode(userId, createPromoCodeDto);

    res.status(201).json(promoCode);
  }

  @Log({ body: true })
  async checkPromoCode(req: Request, res: Response, next: NextFunction) {
    const checkPromoCodeDto = req.body;

    const result = await this.promoCodeService.checkPromoCode(checkPromoCodeDto);

    res.status(200).json(result);
  }

  @Log({ body: true, user: true })
  async deletePromoCode(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.params.id as unknown as number;

    await this.promoCodeService.deletePromoCode(id);

    res.status(200).json({ message: 'Promo code deleted successfully' });
  }

  @Log({ body: true, user: true })
  async updatePromoCode(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    const userId = req.user.id;
    const updatePromoCodeDto = req.body;

    const promoCode = await this.promoCodeService.updatePromoCode(id, userId, updatePromoCodeDto);

    res.status(200).json(promoCode);
  }

  @Log({})
  async findAll(req: Request, res: Response, next: NextFunction) {
    const query = req.query;

    const promoCodes = await this.promoCodeService.findAll(query);

    res.status(200).json(promoCodes);
  }
}
