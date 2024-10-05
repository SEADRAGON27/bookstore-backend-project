import { Router } from 'express';
import { OrderService } from '../services/order.service';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { validation } from '../middlewares/validation.middleware';
import { CreateOrderDto } from '../dto/order.dto';
import { bookRepository, orderRepository, userRepository } from '../utils/initializeRepositories';
import { UpdateBookDto } from '../dto/updateBook.dto';
import { notificationService } from '../services/notification.service';
import { winstonLoggerService } from '../logs/logger';

const router = Router();

const orderService = new OrderService(orderRepository, userRepository, bookRepository, notificationService);
const orderController = new OrderController(orderService, winstonLoggerService);

router.post('/checkout', authMiddleware, validation(CreateOrderDto), orderController.createOrder.bind(orderController));
router.put('/:id', authMiddleware, chechRoleGuard, validation(UpdateBookDto), orderController.updateOrder.bind(orderController));
router.delete('/:id', authMiddleware, chechRoleGuard, orderController.deleteOrder.bind(orderController));
router.get('/all', authMiddleware, chechRoleGuard, orderController.findAll.bind(orderController));
router.post('/confirm/:token', orderController.confirmOrder.bind(orderController));

export default router;
