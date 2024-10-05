import { getHtmlForm } from '../utils/getHtmlForm';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { OrderEntity } from '../entities/order.entity';
import { Repository } from 'typeorm';
import { BookEntity } from '../entities/book.entity';
import { NotificationService } from './notification.service';
import { CustomError } from '../interfaces/customError';

export class PaymentService {
  private liqPayPrivateKey: string;
  constructor(
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly bookRepository: Repository<BookEntity>,
    private readonly notificationService: NotificationService,
  ) {
    this.liqPayPrivateKey = process.env.LIQ_PAY_PRIVATE_KEY;
  }

  async generatePaymentForm(orderId: string, amount: number): Promise<string> {
    const order = await this.orderRepository.findOneBy({ id: orderId });

    if (!order) throw new CustomError(404, "Order doesn't exist");

    const paymentData = {
      version: 3,
      public_key: process.env.LIQ_PAY_PUBLIC_KEY,
      action: 'pay',
      amount: amount,
      currency: 'USD',
      description: 'Payment',
      order_id: orderId,
      server_url: process.env.SERVER_CALLBACK,
    };

    const data = Buffer.from(JSON.stringify(paymentData)).toString('base64');
    const signature = this.strToSign(this.liqPayPrivateKey + data + this.liqPayPrivateKey);

    const htmlForm = getHtmlForm(signature, data);

    return htmlForm;
  }

  strToSign(str: string) {
    const sha1 = crypto.createHash('sha1');
    sha1.update(str);

    return sha1.digest('base64');
  }

  async handleLiqPayWebhook(webhookData) {
    const data = webhookData.data;
    const signature = webhookData.signature;

    const calculatedSignature = this.strToSign(this.liqPayPrivateKey + data + this.liqPayPrivateKey);

    if (signature === calculatedSignature) {
      const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

      if (decodedData.status === 'success') {
        const order = await this.orderRepository.findOne({
          where: { id: decodedData.order_id },
          relations: ['orderedBooks'],
        });

        const token = uuidv4();

        order.status = 'confirmed';
        order.orderedBooks.forEach((book) => {
          book.availableBooks--;
          book.salesCount++;
        });

        const orderUpdated = await this.orderRepository.manager.transaction(async (manager) => {
          await manager.save(order.orderedBooks);

          return await manager.save(order);
        });

        await this.notificationService.sendOrderToMenanger(orderUpdated, token);

        return orderUpdated.id;
      }

      return false;
    }

    return false;
  }
}
