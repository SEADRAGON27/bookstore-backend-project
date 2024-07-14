import { OrderService } from '../services/order.service';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../logs/logger';

export class OrderController {
  constructor(private orderService: OrderService) {}

  async createOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user ? req.user.id : null;
      const createOrderDto = req.body;

      const orderIdentificator = await this.orderService.createOrder(userId, createOrderDto);

      if (orderIdentificator) {
        logger.info({ userId, createOrderDto }, 'Creating a new order successfully');

        return res.status(201).json(orderIdentificator);
      }

      res.status(201).json({ message: 'Order is accepted, wait for call to confirm order.' });
      logger.info({ userId, createOrderDto }, 'Creating a new order successfully');
    
   } catch (error) {
      
      logger.error(error, 'Error creating order');
      next(error);
    
   }
  }

  async confirmOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const token = req.params.token;

      await this.orderService.confirmOrder(token);

      res.status(200).json({ message: 'Order has been confirmed.' });
      logger.info({ token }, 'Confirming order succesfully');
    
   } catch (error) {
      
      logger.error(error, 'Error confirming order');
      next(error);
    
   }
  }

  async deleteOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as unknown as number;

      await this.orderService.deleteOrder(id);

      res.status(200).json({ message: 'Order is deleted' });
      logger.info({ id }, 'Deleting order succesfully');
    
   } catch (error) {
      
      logger.error(error, 'Error deleting order');
      next(error);
    
   }
  }

  async updateOrder(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as unknown as number;
      const updateOrderDto = req.body;
      const order = await this.orderService.updateOrder(id, updateOrderDto);

      res.status(200).json(order);
      logger.info({ id, updateOrderDto }, 'Updating order successfully');
    
   } catch (error) {
      
      logger.error(error, 'Error updating order');
      next(error);
    
   }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const orders = this.orderService.findAll(query);

      res.status(200).json(orders);
      logger.info({ query }, 'Fetching all orders successfully');
    
   } catch (error) {
      
      logger.error(error, 'Error fetching all orders');
      next(error);
    
   }
  }

  async payForOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const payForOrderDto = req.body;
      const formHtml = await this.orderService.payForOrder(payForOrderDto);

      res.status(200).send(formHtml);
      logger.info({ payForOrderDto }, 'Processing payment for order successfully');
    
   } catch (error) {
      
      logger.error(error, 'Error processing payment for order');
      next(error);
    
   }
  }

  async paymentCallBack(req: Request, res: Response, next: NextFunction) {
    try {
      const callBackData = req.body;
      const result = await this.orderService.paymentCallBack(callBackData);

      if (!result) {
        logger.warn('Payment callback unsuccessful, redirecting on the main page');

        return res.redirect('/books/');
      }

      res.sendStatus(200);
      logger.info({ callBackData }, 'Handling payment callback successfully');
    
   } catch (error) {
      
      logger.error(error, 'Error handling payment callback');
      next(error);
    
   }
  }
}
