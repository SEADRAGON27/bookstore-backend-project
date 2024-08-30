/* eslint-disable prettier/prettier */
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { OrderDto } from '../dto/order.dto';
import { CustomError } from '../interfaces/customError';
import { UserEntity } from '../entities/user.entity';
import { transporter } from '../configs/nodemailer.config';
import { v4 as uuidv4 } from 'uuid';
import QueryString from 'qs';
import { str_to_sign } from '../utils/strToSign';
import { liqPayConfig } from '../configs/liqpay.config';
import { PayForOrderDto } from '../dto/payForOrder.dto';
import { BookEntity } from '../entities/book.entity';
import { getHtmlForm } from '../utils/getHtmlForm';

export class OrderService {
  constructor(
    private orderRepository: Repository<OrderEntity>,
    private userRepository: Repository<UserEntity>,
    private bookRepository: Repository<BookEntity>,
  ) {}

  async createOrder(userId: string, createOrderDto: OrderDto) {
    let order = new OrderEntity();

    const bookIds = createOrderDto.books;
    delete createOrderDto.books;

    if (userId) order.user = await this.userRepository.findOneBy({ id: userId });

    const token = uuidv4();

    Object.assign(order, createOrderDto);

    const books = await this.bookRepository.find({ where: { id: In(bookIds) } });

    order.orderedBooks = books;

    order = await this.orderRepository.save(order);

    if (order.paymentMethod === 'cash') {
      order.confirmationToken = token;
      await this.sendOrderToMenanger(order, token);
    } else {
      return order.id;
    }
  }

  async sendOrderToMenanger(order: OrderEntity, token: string) {
    let linkToConfirmOrder: string;

    if (order.paymentMethod === 'card') {
      linkToConfirmOrder = 'Order has been confirmed';
    } else {
      linkToConfirmOrder = `link to confirm order:${process.env.CLIENT_URL}confirm/${token}`;
    }

    const books = order.orderedBooks.map((book) => {
      return ` 
     ----------------------- 
     name:${book.title}
     price:${book.originalPrice}
     discounted price:${book.discountedPrice}
     genre:${book.genre}
     category:${book.category} 
     language:${book.language}
     isbn:${book.isbn}
     -----------------------
     `;
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Order',
      text:
        `
            -----------------------------------------
            Name: ${order.username}
            Last name: ${order.lastName}
            Phone number: ${order.phoneNumber}
            Email: ${order.email}
            City: ${order.city}
            Payment method: ${order.paymentMethod}
            Total sum: ${order.totalSum}
            Delivery method: ${order.deliveryMethod}
            Branch address: ${order.branchAddress}
            Total amount: ${order.quantityOfBooks}
            Books:
            ${books}
            ` + linkToConfirmOrder,
    };

    await transporter.sendMail(mailOptions);
  }

  async confirmOrder(token: string) {
    const order = await this.orderRepository.findOne({
      where: { confirmationToken: token },
      relations: ['orderedBooks'],
    });

    if (token === order.confirmationToken) new CustomError(403, 'Invalid confirmation token');

    order.orderedBooks.map((book) => {
      book.availableBooks--;
      book.salesCount++;
    });

    order.status = 'confirmed';
    order.confirmationToken = null;

    await this.bookRepository.save(order.orderedBooks);
    await this.orderRepository.save(order);
  }

  async updateOrder(id: string, updateOrderDto: OrderDto): Promise<OrderEntity> {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) throw new CustomError(404, "Order doesn't exit.");

    Object.assign(order, updateOrderDto);

    return await this.orderRepository.save(order);
  }

  async deleteOrder(id: string) {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) throw new CustomError(404, "Order doesn't exist.");

    await this.orderRepository.delete({ id });
  }

  async findAll(query: QueryString.ParsedQs): Promise<OrderEntity[]> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');
    
    this.addStatus(query,queryBuilder);
    this.addPaymentMethod(query,queryBuilder);
    this.addUsername(query,queryBuilder);
    this.addCreatedAt(query,queryBuilder);
    this.addCity(query,queryBuilder);
  
    return await queryBuilder.orderBy('createdAt', 'DESC').getMany();
  }

  async addCity(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<OrderEntity>){
    if (query.city) queryBuilder.andWhere('order.city = :city', { city: query.city });
  }

  async addPaymentMethod(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<OrderEntity>) {
    if (query.paymentMethod) 
      queryBuilder.andWhere('order.paymentMethod = :paymentMethod', { paymentMethod: query.paymentMethod });
  }
  
  async addStatus(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<OrderEntity>) {
    if (query.status) queryBuilder.andWhere('order.status =:status', { status: query.status });
  }
  
  async addCreatedAt(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<OrderEntity>){
    if (query.createdAt) queryBuilder.andWhere('DATE(order.createdAt) = :createdAt', { createdAt: query.createdAt });
  }
  
  async addUsername(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<OrderEntity>){
    if (query.username) queryBuilder.andWhere('order.userName = username', { username: query.username });
  }
  
  async payForOrder(payForOrderDto: PayForOrderDto): Promise<string> {
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

   
    const htmlForm = getHtmlForm(signature,data);

    return htmlForm;
  }

  async paymentCallBack(callBackData) {
    const data = callBackData.data;
    const signature = callBackData.signature;

    const calculatedSignature = str_to_sign(liqPayConfig.liqPayPrivateKey + data + liqPayConfig.liqPayPrivateKey);

    if (signature === calculatedSignature) {
      const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

      if (decodedData.status === 'success') {
        let order = await this.orderRepository.findOne({
          where: { id: decodedData.order_id },
          relations: ['orderedBooks'],
        });

        const token = uuidv4();

        order.status = 'confirmed';
        order.orderedBooks.forEach((book) => {
          book.availableBooks--;
          book.salesCount++;
        });

        await this.bookRepository.save(order.orderedBooks);
        order = await this.orderRepository.save(order);
        await this.sendOrderToMenanger(order, token);

        return true;
      }

      await this.orderRepository.delete({ id: decodedData.order_id });

      return false;
    }

    return false;
  }
}
