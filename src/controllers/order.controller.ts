import { OrderService } from '../services/order.service';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { NextFunction, Request, Response } from 'express';
import { WinstonLoggerService } from '../logs/logger';
import { exceptionType } from '../utils/exceptionType';

export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user ? req.user.id : null;
    const createOrderDto = req.body;

    try {
      const orderIdentificator = await this.orderService.createOrder(userId, createOrderDto);

      if (orderIdentificator) {
        res.status(201).json(orderIdentificator);
        this.logger.log(`Order created successfully. User ID: ${userId}, Order Data: ${JSON.stringify(createOrderDto)}`);
      }

      res.status(201).json({ message: 'Order is accepted, wait for a call to confirm the order.' });

      this.logger.log(`Order accepted successfully. User ID: ${userId}, Order Data: ${JSON.stringify(createOrderDto)}`);
    } catch (error) {
      this.logger.error(`Error creating order. User ID: ${userId}, Error: ${error.message}`);
      next(error);
    }
  }

  async confirmOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    const token = req.params.token;

    try {
      await this.orderService.confirmOrder(token);

      res.status(200).json({ message: 'Order has been confirmed.' });

      this.logger.log(`Order confirmed successfully. Token: ${token}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error confirming order. Token: ${token}, Error: ${error.message}`);

      next(error);
    }
  }

  async deleteOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.params.id;

    try {
      await this.orderService.deleteOrder(id);

      res.status(200).json({ message: 'Order has been deleted.' });

      this.logger.log(`Order deleted successfully. Order ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error deleting order. Order ID: ${id}, Error: ${error.message}`);

      next(error);
    }
  }

  async updateOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.params.id;
    const updateOrderDto = req.body;

    try {
      const order = await this.orderService.updateOrder(id, updateOrderDto);

      res.status(200).json(order);

      this.logger.log(`Order updated successfully. Order ID: ${id}, Updated Data: ${JSON.stringify(updateOrderDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error updating order. Order ID: ${id}, Error: ${error.message}`);

      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    const query = req.query;

    try {
      const orders = await this.orderService.findAll(query);

      res.status(200).json(orders);

      this.logger.log(`Orders fetched successfully. Query: ${JSON.stringify(query)}`);
    } catch (error) {
      this.logger.error(`Error fetching orders. Query: ${JSON.stringify(query)}, Error: ${error.message}`);
      next(error);
    }
  }
}
