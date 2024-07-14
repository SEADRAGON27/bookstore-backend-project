import { Router } from 'express';
import { dataSource } from '../configs/orm.config';
import { PromoCodeEntity } from '../entities/promocode.entity';
import { PromoCodeService } from '../services/promoCode.service';
import { UserEntity } from '../entities/user.entity';
import { PromoCodeController } from '../controllers/promoCode.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { validation } from '../middlewares/validation.middleware';
import { createPromoCode } from '../dto/createPromoCode.dto';
import { updatePromoCode } from '../dto/updatePromCode.dto';

const router = Router();

const promoCodeRepository = dataSource.getRepository(PromoCodeEntity);
const userRepository = dataSource.getRepository(UserEntity);
const promoCodeService = new PromoCodeService(promoCodeRepository, userRepository);
const promoCodeController = new PromoCodeController(promoCodeService);

router.post('/create', authMiddleware, chechRoleGuard, validation(createPromoCode), promoCodeController.createPromoCode.bind(promoCodeController));
router.put('/update/:id', authMiddleware, chechRoleGuard, validation(updatePromoCode), promoCodeController.updatePromoCode.bind(promoCodeController));
router.delete('/delete/:id', authMiddleware, chechRoleGuard, promoCodeController.deletePromoCode.bind(promoCodeController));
router.post('/check-promo-code', promoCodeController.checkPromoCode.bind(promoCodeController));
router.get('/all', authMiddleware, chechRoleGuard, promoCodeController.findAll.bind(promoCodeController));
