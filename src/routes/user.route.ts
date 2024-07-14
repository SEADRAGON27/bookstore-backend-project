import { Router } from 'express';
import { UserEntity } from '../entities/user.entity';
import { dataSource } from '../configs/orm.config';
import { UserService } from '../services/user.service';
import { RefreshSessionEntity } from '../entities/refreshSession.entity';
import { UserController } from '../controllers/user.controller';
import { validation } from '../middlewares/validation.middleware';
import { CreateUserDto } from '../dto/createUser.dto';
import { ResetPasswordEntity } from '../entities/resetPassword.entity';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authGuard } from '../guards/auth.guard';
import { UpdateUserDTO } from '../dto/updateUser.dto';
import { LoginUserDTO } from '../dto/loginUser.dto';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PasswordResetRequestDTO } from '../dto/passwordResetRequest.dto';
import { PasswordResetDTO } from '../dto/passwordReset.dto';
import { oauthConfig } from '../configs/OAuth2.config';

const router = Router();

const userRepository = dataSource.getRepository(UserEntity);
const refreshSessionRepository = dataSource.getRepository(RefreshSessionEntity);
const resetPasswordRepository = dataSource.getRepository(ResetPasswordEntity);
const userService = new UserService(userRepository, refreshSessionRepository, resetPasswordRepository);
const userController = new UserController(userService);

passport.initialize();
passport.use(new GoogleStrategy(oauthConfig, userController.startGoogleAuthification.bind(userController)));

router.post('/register', validation(CreateUserDto), userController.createUser.bind(userController));
router.post('/confirm/:token', userController.confirmEmailForRegistration.bind(userController));
router.post('/request-password-reset', validation(PasswordResetRequestDTO), userController.requestPasswordReset.bind(userController));
router.post('/reset-password', validation(PasswordResetDTO), userController.resetPassword.bind(userController));
router.put('/user', authMiddleware, authGuard, validation(UpdateUserDTO), userController.updateUser.bind(userController));
router.delete('/user', authMiddleware, authGuard, userController.deleteUser.bind(userController));
router.post('/login', authMiddleware, authGuard, validation(LoginUserDTO), userController.loginUser.bind(userController));
router.post('/logout', authMiddleware, authGuard, userController.logoutUser.bind(userController));
router.post('/refresh', userController.refresh.bind(userController));
router.get('/user', authMiddleware, authGuard, userController.getUser.bind(userController));
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/callback/google', passport.authenticate('google', { session: false }), userController.finishGoogleAuthificaton.bind(userController));

export default router;
