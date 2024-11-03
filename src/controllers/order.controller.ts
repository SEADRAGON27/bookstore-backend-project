import { OrderService } from '../services/order.service';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { NextFunction, Request, Response } from 'express';
import { Log } from '../decorators/log.decorator';

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Log({ body: true, user: true })
  async createOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user ? req.user.id : null;
    const createOrderDto = req.body;

    const orderIdentificator = await this.orderService.createOrder(userId, createOrderDto);

    if (orderIdentificator) {
      return res.status(201).json(orderIdentificator);
    }

    res.status(201).json({ message: 'Order is accepted, wait for a call to confirm the order.' });
  }

  @Log({ params: true })
  async confirmOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    const token = req.params.token;

    await this.orderService.confirmOrder(token);

    res.status(200).json({ message: 'Order has been confirmed.' });
  }

  @Log({ params: true })
  async deleteOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.params.id;

    await this.orderService.deleteOrder(id);

    res.status(200).json({ message: 'Order has been deleted.' });
  }

  @Log({ body: true, params: true })
  async updateOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.params.id;
    const updateOrderDto = req.body;

    const order = await this.orderService.updateOrder(id, updateOrderDto);

    res.status(200).json(order);
  }

  @Log({ query: true })
  async findAll(req: Request, res: Response, next: NextFunction) {
    const query = req.query;

    const orders = await this.orderService.findAll(query);

    res.status(200).json(orders);
  }
}
