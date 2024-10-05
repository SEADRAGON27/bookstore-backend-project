import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/order.dto';
import { UpdateOrderDto } from '../dto/updateOrder.dto';
import { CustomError } from '../interfaces/customError';
import { UserEntity } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import QueryString from 'qs';
import { BookEntity } from '../entities/book.entity';
import { NotificationService } from './notification.service';

export class OrderService {
  constructor(
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly userRepository: Repository<UserEntity>,
    private readonly bookRepository: Repository<BookEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
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
      await this.notificationService.sendOrderToMenanger(order, token);
    } else {
      return order.id;
    }
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

    await this.bookRepository.manager.transaction(async (manager) => {
      await manager.save(order.orderedBooks);
      await manager.save(order);
    });
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderEntity> {
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

    this.addStatus(query, queryBuilder);
    this.addPaymentMethod(query, queryBuilder);
    this.addUsername(query, queryBuilder);
    this.addCreatedAt(query, queryBuilder);
    this.addCity(query, queryBuilder);

    return await queryBuilder.orderBy('createdAt', 'DESC').getMany();
  }

  async addCity(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<OrderEntity>) {
    if (query.city) queryBuilder.andWhere('order.city = :city', { city: query.city });
  }

  async addPaymentMethod(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<OrderEntity>) {
    if (query.paymentMethod) queryBuilder.andWhere('order.paymentMethod = :paymentMethod', { paymentMethod: query.paymentMethod });
  }

  async addStatus(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<OrderEntity>) {
    if (query.status) queryBuilder.andWhere('order.status =:status', { status: query.status });
  }

  async addCreatedAt(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<OrderEntity>) {
    if (query.createdAt) queryBuilder.andWhere('DATE(order.createdAt) = :createdAt', { createdAt: query.createdAt });
  }

  async addUsername(query: QueryString.ParsedQs, queryBuilder: SelectQueryBuilder<OrderEntity>) {
    if (query.username) queryBuilder.andWhere('order.userName = username', { username: query.username });
  }
}
