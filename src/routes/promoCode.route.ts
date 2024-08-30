import { Router } from 'express';
import { PromoCodeService } from '../services/promoCode.service';
import { PromoCodeController } from '../controllers/promoCode.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { validation } from '../middlewares/validation.middleware';
import { PromoCode } from '../dto/createPromoCode.dto';
import { promoCodeRepository } from '../utils/initializeRepositories';
import { CheckPromoCode } from '../dto/checkPromoCode.dto';

const router = Router();

const promoCodeService = new PromoCodeService(promoCodeRepository);
const promoCodeController = new PromoCodeController(promoCodeService);

router.post('/create', authMiddleware, chechRoleGuard, validation(PromoCode), promoCodeController.createPromoCode.bind(promoCodeController));
router.put('/:id', authMiddleware, chechRoleGuard, validation(PromoCode), promoCodeController.updatePromoCode.bind(promoCodeController));
router.delete('/:id', authMiddleware, chechRoleGuard, promoCodeController.deletePromoCode.bind(promoCodeController));
router.post('/check-promo-code', validation(CheckPromoCode), promoCodeController.checkPromoCode.bind(promoCodeController));
router.get('/all', authMiddleware, chechRoleGuard, promoCodeController.findAll.bind(promoCodeController));

export default router;
