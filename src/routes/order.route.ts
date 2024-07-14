import { Router } from 'express';
import { dataSource } from '../configs/orm.config';
import { OrderEntity } from '../entities/order.entity';
import { OrderService } from '../services/order.service';
import { OrderController } from '../controllers/order.controller';
import { UserEntity } from '../entities/user.entity';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { validation } from '../middlewares/validation.middleware';
import { createOrderDto } from '../dto/createOrder.dto';
import { updateOrderDto } from '../dto/updateOrder.dto';

const router = Router();

const orderRepository = dataSource.getRepository(OrderEntity);
const userRepository = dataSource.getRepository(UserEntity);
const orderService = new OrderService(orderRepository, userRepository);
const orderController = new OrderController(orderService);

router.post('/checkout', authMiddleware, validation(createOrderDto), orderController.createOrder.bind(orderController));
router.put('/update/:id', authMiddleware, chechRoleGuard, validation(updateOrderDto), orderController.updateOrder.bind(orderController));
router.delete('/delete/:id', authMiddleware, chechRoleGuard, orderController.deleteOrder.bind(orderController));
router.get('/all', authMiddleware, chechRoleGuard, orderController.findAll.bind(orderController));
router.post('/confirm/:token', orderController.confirmOrder.bind(orderController));
router.post('/pay', orderController.payForOrder.bind(orderController));
router.post('/payment-callback', orderController.paymentCallBack.bind(orderController));

export default router;
