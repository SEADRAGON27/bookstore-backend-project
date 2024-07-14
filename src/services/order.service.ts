import { Repository } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { createOrderDto } from '../dto/createOrder.dto';
import { CustomError } from '../interfaces/customError';
import { UserEntity } from '../entities/user.entity';
import { transporter } from '../configs/nodemailer.config';
import { v4 as uuidv4 } from 'uuid';
import { updateOrderDto } from '../dto/updateOrder.dto';
import QueryString from 'qs';
import { str_to_sign } from '../utils/strToSign';
import { liqPayConfig } from '../configs/liqpay.config';
import { PayForOrderDto } from '../dto/payForOrder.dto';

export class OrderService {
  constructor(
    private orderRepository: Repository<OrderEntity>,
    private userRepository: Repository<UserEntity>,
  ) {}

  async createOrder(userId: number, createOrderDto: createOrderDto) {
    let order = new OrderEntity();
    Object.assign(order, createOrderDto);

    if (userId) order.user = await this.userRepository.findOneBy({ id: userId });

    const token = uuidv4();

    order.promo_code = createOrderDto.promoCode;

    order = await this.orderRepository.save(order);

    if (order.payment_method === 'cash') {
      await this.sendOrderToMenanger(order, token);
    } else {
      return order.id;
    }
  }

  async sendOrderToMenanger(order: OrderEntity, token: string) {
    let linkToConfirmOrder: string;

    if (order.payment_method === 'card') {
      linkToConfirmOrder = 'Order has been confirmed';
    } else {
      linkToConfirmOrder = `link to confirm order:${process.env.CLIENT_URL}confirm/${token}`;
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Order',
      text:
        `
            -----------------------------------------
            Name: ${order.name}
            Last Name: ${order.last_name}
            Phone Number: ${order.phone_number}
            Email: ${order.email}
            City: ${order.city}
            Payment Method: ${order.payment_method}
            Amount: $${order.amount}
            Delivery Method: ${order.delivery_method}
            Branch Address: ${order.branch_address}
            Total Amount: $${order.total_amount}
            -----------------------------------------` + linkToConfirmOrder,
    };

    await transporter.sendMail(mailOptions);
  }

  async confirmOrder(token: string) {
    const order = await this.orderRepository.findOneBy({ confirmation_token: token });

    if (token === order.confirmation_token) new CustomError(403, 'Invalid confirmation token');

    order.status = 'confirmed';

    await this.orderRepository.save(order);
  }

  async updateOrder(id: number, updateOrderDto: updateOrderDto): Promise<OrderEntity> {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) throw new CustomError(404, "Order doesn't exit.");

    Object.assign(order, updateOrderDto);

    return await this.orderRepository.save(order);
  }

  async deleteOrder(id: number): Promise<void> {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) throw new CustomError(404, "Order doesn't exist.");

    await this.orderRepository.delete({ id });
  }

  async findAll(query: QueryString.ParsedQs): Promise<OrderEntity[]> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (query.city) {
      queryBuilder.andWhere('order.city = :city', { city: query.city });
    }

    if (query.paymentMethod) {
      queryBuilder.andWhere('order.payment_method = :paymentMethod', { paymentMethod: query.paymentMethod });
    }

    if (query.branchAddress) {
      queryBuilder.andWhere('order.branch_address = :branchAddress', { branchAddress: query.branchAddress });
    }

    if (query.status) {
      queryBuilder.andWhere('order.status = :status', { status: query.status });
    }

    if (query.created_at) {
      queryBuilder.andWhere('DATE(order.created_at) = :createAt', { createdAt: query.createdAt });
    }

    return await queryBuilder.orderBy('create_at', 'DESC').getMany();
  }

  async payForOrder(payForOrderDto: PayForOrderDto) {
    const paymentData = {
      version: 3,
      public_key: liqPayConfig.liqPayPublicKey,
      action: 'pay',
      amount: payForOrderDto.amount,
      currency: 'USD',
      description: 'Payment',
      order_id: payForOrderDto.identificator,
      server_url: process.env.SERVER_CALLBACK,
    };

    const data = Buffer.from(JSON.stringify(paymentData)).toString('base64');
    const signature = str_to_sign(liqPayConfig.liqPayPrivateKey + data + liqPayConfig.liqPayPrivateKey);

    const formHtml = `
      <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LiqPay Payment</title>
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                }
                .container {
                    text-align: center;
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    background-color: #4CAF50;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background-color: #45a049;
                }
            </style>
            </head>
        <body>
            <form id="liqpayForm" method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
                <input type="hidden" name="data" value="${data}">
                <input type="hidden" name="signature" value="${signature}">
                <input type="image" src="//static.liqpay.ua/buttons/payUk.png" alt="Pay with LiqPay">
            </form>
        </body>
        </html>`;

    return formHtml;
  }

  async paymentCallBack(callBackData) {
    const data = callBackData.data;
    const signature = callBackData.signature;

    const calculatedSignature = str_to_sign(liqPayConfig.liqPayPrivateKey + data + liqPayConfig.liqPayPrivateKey);

    if (signature === calculatedSignature) {
      const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

      if (decodedData.status === 'success') {
        const order = await this.orderRepository.findOneBy({ id: decodedData.order_id });
        const token = uuidv4();
        order.status = 'confirmed';
        await this.sendOrderToMenanger(order, token);

        return true;
      }

      await this.orderRepository.delete({ id: decodedData.order_id });

      return false;
    } else {
      return false;
    }
  }
}
