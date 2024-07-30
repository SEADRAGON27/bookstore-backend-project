import { Router } from 'express';
import { OrderService } from '../services/order.service';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { validation } from '../middlewares/validation.middleware';
import { OrderDto } from '../dto/order.dto';

import { bookRepository, orderRepository, userRepository } from '../utils/initializeRepositories';

const router = Router();

const orderService = new OrderService(orderRepository, userRepository, bookRepository);
const orderController = new OrderController(orderService);

router.post('/checkout', authMiddleware, validation(OrderDto), orderController.createOrder.bind(orderController));
router.put('/:id', authMiddleware, chechRoleGuard, validation(OrderDto), orderController.updateOrder.bind(orderController));
router.delete('/:id', authMiddleware, chechRoleGuard, orderController.deleteOrder.bind(orderController));
router.get('/all', authMiddleware, chechRoleGuard, orderController.findAll.bind(orderController));
router.post('/confirm/:token', orderController.confirmOrder.bind(orderController));
router.post('/pay', orderController.payForOrder.bind(orderController));
router.post('/payment-callback', orderController.paymentCallBack.bind(orderController));

export default router;
