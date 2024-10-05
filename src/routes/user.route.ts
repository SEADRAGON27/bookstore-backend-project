/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from 'express';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { validation } from '../middlewares/validation.middleware';
import { CreateUserDto, CreateUserGoogleDto } from '../dto/createUser.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authGuard } from '../guards/auth.guard';
import { UpdateUserDto } from '../dto/updateUser.dto';
import { LoginUserDto} from '../dto/loginUser.dto';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PasswordResetRequestDTO } from '../dto/passwordResetRequest.dto';
import { PasswordResetDTO } from '../dto/passwordReset.dto';
import { refreshSessionRepository, resetPasswordRepository, userRepository } from '../utils/initializeRepositories';
import { oauthConfig } from '../configs/OAuth2.config';
import { VerifyCallback } from 'passport-google-oauth20';
import { notificationService } from '../services/notification.service';
import { winstonLoggerService } from '../logs/logger';
const router = Router();

const userService = new UserService(userRepository, refreshSessionRepository, resetPasswordRepository,notificationService);
const userController = new UserController(userService,winstonLoggerService);

passport.initialize();
passport.use(new GoogleStrategy(oauthConfig, async (
    accessToken: string, 
    refreshToken: string, 
    profile: any, 
    done: VerifyCallback) =>{ 
        const user = {accessToken}
        done(null, user);
    }));

router.post('/register', validation(CreateUserDto), userController.createUser.bind(userController));
router.post('/admin/login', validation(LoginUserDto), userController.loginUser.bind(userController));
router.post('/confirm-email', userController.confirmEmailForRegistration.bind(userController));
router.post('/request-password-reset', validation(PasswordResetRequestDTO), userController.requestPasswordReset.bind(userController));
router.post('/reset-password', validation(PasswordResetDTO), userController.resetPassword.bind(userController));
router.put('/user', authMiddleware, authGuard, validation(UpdateUserDto), userController.updateUser.bind(userController));
router.delete('/user', authMiddleware, authGuard, userController.deleteUser.bind(userController));
router.post('/login', authMiddleware, validation(LoginUserDto), userController.loginUser.bind(userController));
router.post('/logout', authMiddleware, authGuard, userController.logoutUser.bind(userController));
router.post('/refresh', userController.refresh.bind(userController));
router.get('/user', authMiddleware, authGuard, userController.getUser.bind(userController));
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',passport.authenticate('google', { session:false }), userController.googleAuthRedirect.bind(userController));
router.post('/success-google-auth',validation(CreateUserGoogleDto),userController.successGoogleAuth.bind(userController))
router.get('/confirm-google-email',userController.confirmGoogleEmail.bind(userController))

export default router;
