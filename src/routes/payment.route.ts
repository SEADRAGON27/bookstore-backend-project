import { Router } from 'express';
import { PaymentService } from '../services/payment.service';
import { bookRepository, orderRepository } from '../utils/initializeRepositories';
import { PaymentController } from '../controllers/payment.controller';
import { notificationService } from '../services/notification.service';
import { winstonLoggerService } from '../logs/logger';

const router = Router();

const paymentService = new PaymentService(orderRepository, bookRepository, notificationService);
const paymentController = new PaymentController(paymentService, winstonLoggerService);

router.get('/pay/:orderId', paymentController.generatePaymentForm.bind(paymentController));
router.post('/handle-webhook', paymentController.handleLiqPayWebook.bind(paymentController));

export default router;
