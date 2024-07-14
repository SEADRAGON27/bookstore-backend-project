import { NextFunction, Request, Response } from 'express';
import { logger } from '../logs/logger';
import { UserService } from '../services/user.service.js';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { Profile, VerifyCallback } from 'passport-google-oauth20';

export class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const fingerprint = req.fingerprint.hash;
      const createUserDto = req.body;

      await this.userService.createUser(createUserDto, fingerprint);

      res.status(201).json({ message: 'User registered. Please check your email for the confirmation code.' });
      logger.info({ createUserDto, fingerprint }, 'Creating a new user succesfully');
    
    } catch (error) {
      
        logger.error(error, 'Error creating user');
      next(error);
    
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const fingerprint = req.fingerprint.hash;
      const loginUserDTO = req.body;

      const { user, refreshToken } = await this.userService.loginUser(loginUserDTO, fingerprint);

      const userResponse = this.userService.buildUserResponse(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
      });

      res.status(200).json(userResponse);
      logger.info({ loginUserDTO, fingerprint }, 'Logging in user successfully');
    
    } catch (error) {
      
        logger.error(error, 'Error logging in user');
      next(error);
    
    }
  }

  async getUser(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = req.user.id;

      const user = await this.userService.getUser(id);

      res.status(200).json(user);
      logger.info({ id }, 'Fetching user details successfully');
    } catch (error) {
      
      logger.error(error, 'Error fetching user details');
      next(error);
    
    }
  }

  async updateUser(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const updateUserDTO = req.body;
      const userId = req.user.id;

      const user = await this.userService.updateUser(userId, updateUserDTO);

      const userResponse = this.userService.buildUserResponse(user);

      res.status(200).json(userResponse);
      logger.info({ updateUserDTO, userId }, 'Updating user details succesfully');
    
    } catch (error) {
      
      logger.error(error, 'Error updating user');
      next(error);
    
    }
  }

  async deleteUser(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;

      await this.userService.deleteUser(userId);
      res.status(200).send({ message: 'User has been deleted successfully' });
      logger.info({ userId }, 'Deleting user successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error deleting user');
      next(error);
    
    }
  }

  async logoutUser(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const userId = req.user.id;

      await this.userService.deleteRefreshSession(refreshToken);

      res.status(200).clearCookie('refreshToken');
      logger.info({ userId }, 'Logging out user successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error logging out user');
      next(error);
    
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const fingerprint = req.fingerprint.hash;
      const currentRefreshToken = req.cookies.refreshToken;

      const { accessToken, refresh_token, tokenExpiration } = await this.userService.refresh(currentRefreshToken, fingerprint);

      res.cookie('refreshToken', refresh_token, {
        httpOnly: true,
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
      });

      res.status(200).json({ accessToken, tokenExpiration });
      logger.info({ currentRefreshToken }, 'Refreshing tokens successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error refreshing tokens');
      next(error);
    
    }
  }

  async confirmEmailForRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token;
      const fingerprint = req.fingerprint.hash;

      const { user, refresh_token } = await this.userService.confirmEmail(token, fingerprint);

      const userResponse = this.userService.buildUserResponse(user);

      res.cookie('refreshToken', refresh_token, {
        httpOnly: true,
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
      });

      res.status(200).json(userResponse);
      logger.info({ token, fingerprint }, 'Confirming email for registration successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error confirming email for registration');
      next(error);
    
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      await this.userService.requestPasswordReset(email);

      res.status(200).send({ message: 'Password reset email sent.' });
      logger.info({ email }, 'Requesting password reset successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error requesting password reset');
      next(error);
    
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newPassword = req.body;
      const token = req.params.token;

      await this.userService.resetPassword(token, newPassword);

      res.status(200).send({ message: 'Password has been reset.' });
      logger.info('Resetting password successfully');
    
    } catch (error) {
      
      logger.error('Error reseting password');
      next(error);
    
    }
  }

  async startGoogleAuthification(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    try {
      const user = await this.userService.findOrCreate(profile);

      done(null, user);
      logger.info({ profile }, 'Google authentication started successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error starting Google authentication');
      done(error as Error);
    
    }
  }

  async finishGoogleAuthificaton(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const fingerPrint = req.fingerprint.hash;
      const { user, refresh_token } = await this.userService.finishGoogleAuthification(userId, fingerPrint);
      const userResponse = this.userService.buildUserResponse(user);

      res.cookie('refreshToken', refresh_token, {
        httpOnly: true,
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
      });

      res.status(200).json(userResponse);
      logger.info({ userId, fingerPrint }, 'Finishing Google authentication');
    
    } catch (error) {
      
      logger.error(error, 'Error finishing Google authentication');
      next(error);
    
    }
  }
}
