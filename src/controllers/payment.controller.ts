import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { Log } from '../decorators/log.decorator';

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  async generatePaymentForm(req: Request, res: Response, next: NextFunction) {
    const orderId = req.params.orderId;
    const formHtml = await this.paymentService.generatePaymentForm(orderId);

    res.status(200).send(formHtml);
  }

  @Log({})
  async handleLiqPayWebook(req: Request, res: Response, next: NextFunction) {
    const webhookData = req.body;
    console.log('data', req.body);
    await this.paymentService.handleLiqPayWebhook(webhookData);

    res.sendStatus(200);
  }
}
