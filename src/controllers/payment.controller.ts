import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { Log } from '../decorators/log.decorator';

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  async generatePaymentForm(req: Request, res: Response, next: NextFunction) {
    const orderId = req.params.orderId;
    const amount = +req.query.amount;
    const formHtml = await this.paymentService.generatePaymentForm(orderId, amount);

    res.status(200).send(formHtml);
  }

  @Log({ body: true })
  async handleLiqPayWebook(req: Request, res: Response, next: NextFunction) {
    const webhookData = req.body;
    const orderId = await this.paymentService.handleLiqPayWebhook(webhookData);

    if (!orderId) {
      return res.redirect('/books/');
    }

    res.sendStatus(200);
  }
}
