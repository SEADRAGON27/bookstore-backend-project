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
      const loginUserDto = req.body;

      const { user, refreshToken } = await this.userService.loginUser(loginUserDto, fingerprint);

      const userResponse = this.userService.buildUserResponse(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
      });

      res.status(200).json(userResponse);
      logger.info({ loginUserDto, fingerprint }, 'Logging in user successfully');
    
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
      const updateUserDto = req.body;
      const id = req.user.id;

      const data = await this.userService.updateUser(id, updateUserDto);

      if (!data) {
        return res.sendStatus(200);
      }

      const { user, refreshToken } = data;
      const userResponse = this.userService.buildUserResponse(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: +process.env.REFRESH_TOKEN_EXPIRATION_15DAYS,
      });

      res.status(200).json(userResponse);

      logger.info({ updateUserDto, id }, 'Updating user details succesfully');
    
    } catch (error) {

      logger.error(error, 'Error updating user');
      next(error);
    
    }
  }

  async deleteUser(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = req.user.id;

      await this.userService.deleteUser(id);
      
      res.status(200).send({ message: 'User has been deleted successfully' });
      logger.info({ id }, 'Deleting user successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error deleting user');
      next(error);
    
    }
  }

  async logoutUser(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const id = req.user.id;

      await this.userService.deleteRefreshSession(refreshToken);

      res.status(200).clearCookie('refreshToken');
      logger.info({ id }, 'Logging out user successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error logging out user');
      next(error);
    
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const fingerprint = req.fingerprint.hash;
      const currentRefreshToken = req.cookies.refreshToken;

      const { accessToken, refreshToken, tokenExpiration } = await this.userService.refresh(currentRefreshToken, fingerprint);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: +process.env.REFRESH_TOKEN_EXPIRATION_15DAYS,
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
      const token = req.query.token as string;
      const fingerprint = req.fingerprint.hash;

      const { user, refreshToken } = await this.userService.confirmEmail(token, fingerprint);

      const userResponse = this.userService.buildUserResponse(user);

      res.cookie('refreshToken', refreshToken, {
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
      const resetPasswordDto = req.body;
      const token = req.query.token as string;

      await this.userService.resetPassword(token, resetPasswordDto);

      res.status(200).send({ message: 'Password has been reset.' });
      logger.info('Resetting password successfully');
    
    } catch (error) {
      
      logger.error('Error reseting password');
      next(error);
    
    }
  }

  async googleAuthRedirect(req: Request, res: Response) {
    const token = req.user['accessToken'];

    return res.redirect(`http://localhost:3000/users/confirm-google-email?token=${token}`);
  }

  async confirmGoogleEmail(req: Request, res: Response) {
    const token = req.query.token;
    res.status(200).json({ token });
  }

  async successGoogleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const createUserGoogleDto = req.body;
      const responce = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${createUserGoogleDto.token}`);

      const { email } = await responce.json();
      const fingerprint = req.fingerprint.hash;

      const { user, refreshToken } = await this.userService.finishGoogleAuth(createUserGoogleDto, email, fingerprint);
      const userResponse = this.userService.buildUserResponse(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
      });

      res.status(200).json(userResponse);
      logger.info(user.email, 'Google authentication has been completed');
    
    } catch (error) {
      
      logger.error(error, 'Error Google authentication');
      next(error);
    
    }
  }
}
