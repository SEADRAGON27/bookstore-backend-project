import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { WinstonLoggerService } from '../logs/logger';

export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private logger: WinstonLoggerService,
  ) {}

  async generatePaymentForm(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId;
      const amount = +req.query.amount;
      const formHtml = await this.paymentService.generatePaymentForm(orderId, amount);

      res.status(200).send(formHtml);
    } catch (error) {
      next(error);
    }
  }

  async handleLiqPayWebook(req: Request, res: Response, next: NextFunction) {
    try {
      const webhookData = req.body;
      const orderId = await this.paymentService.handleLiqPayWebhook(webhookData);

      if (!orderId) {
        this.logger.error('Payment webhook unsuccessfuly, redirecting on the main page');

        return res.redirect('/books/');
      }

      res.sendStatus(200);

      this.logger.log('Payment webhook handled successfully');
    } catch (error) {
      this.logger.error(`Error handling payment callback. Error:${error.message}`);
      next(error);
    }
  }
}
