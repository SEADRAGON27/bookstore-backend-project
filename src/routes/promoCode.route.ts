import { Router } from 'express';
import { PromoCodeService } from '../services/promoCode.service';
import { PromoCodeController } from '../controllers/promoCode.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { validation } from '../middlewares/validation.middleware';
import { CreatePromoCodeDto } from '../dto/createPromoCode.dto';
import { promoCodeRepository, userRepository } from '../utils/initializeRepositories';
import { CheckPromoCode } from '../dto/checkPromoCode.dto';
import { UpdatePromoCodeDto } from '../dto/updatePromoCode.dto';
import { winstonLoggerService } from '../logs/logger';

const router = Router();

const promoCodeService = new PromoCodeService(promoCodeRepository, userRepository);
const promoCodeController = new PromoCodeController(promoCodeService, winstonLoggerService);

router.post('/create', authMiddleware, chechRoleGuard, validation(CreatePromoCodeDto), promoCodeController.createPromoCode.bind(promoCodeController));
router.put('/:id', authMiddleware, chechRoleGuard, validation(UpdatePromoCodeDto), promoCodeController.updatePromoCode.bind(promoCodeController));
router.delete('/:id', authMiddleware, chechRoleGuard, promoCodeController.deletePromoCode.bind(promoCodeController));
router.post('/check-promo-code', validation(CheckPromoCode), promoCodeController.checkPromoCode.bind(promoCodeController));
router.get('/all', authMiddleware, chechRoleGuard, promoCodeController.findAll.bind(promoCodeController));

export default router;
