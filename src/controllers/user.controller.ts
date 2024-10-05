import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { WinstonLoggerService } from '../logs/logger.js';
import { exceptionType } from '../utils/exceptionType.js';

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createUser(req: Request, res: Response, next: NextFunction) {
    const fingerprint = req.fingerprint.hash;
    const createUserDto = req.body;

    try {
      await this.userService.createUser(createUserDto, fingerprint);

      res.status(201).json({ message: 'User registered. Please check your email for the confirmation code.' });

      this.logger.log(`User created successfully. User Data: ${JSON.stringify(createUserDto)}, Fingerprint: ${fingerprint}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error creating user. Fingerprint: ${fingerprint}, Error: ${error.message}`);

      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    const fingerprint = req.fingerprint.hash;
    const loginUserDto = req.body;

    try {
      const { user, refreshToken } = await this.userService.loginUser(loginUserDto, fingerprint);
      const userResponse = this.userService.buildUserResponse(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
      });

      res.status(200).json(userResponse);

      this.logger.log(`User logged in successfully. User Data: ${JSON.stringify(loginUserDto)}, Fingerprint: ${fingerprint}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error logging in user. Fingerprint: ${fingerprint}, Error: ${error.message}`);

      next(error);
    }
  }

  async getUser(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.user.id;

    try {
      const user = await this.userService.getUser(id);
      res.status(200).json(user);

      this.logger.log(`User details fetched successfully. User ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error fetching user details. User ID: ${id}, Error: ${error.message}`);
      next(error);
    }
  }

  async updateUser(req: ExpressRequest, res: Response, next: NextFunction) {
    const updateUserDto = req.body;
    const id = req.user.id;

    try {
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

      this.logger.log(`User details updated successfully. User ID: ${id}, Updated Data: ${JSON.stringify(updateUserDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error updating user. User ID: ${id}, Error: ${error.message}`);

      next(error);
    }
  }

  async deleteUser(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.user.id;

    try {
      await this.userService.deleteUser(id);
      res.status(200).send({ message: 'User has been deleted successfully' });

      this.logger.log(`User deleted successfully. User ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting user. User ID: ${id}, Error: ${error.message}`);
      next(error);
    }
  }

  async logoutUser(req: ExpressRequest, res: Response, next: NextFunction) {
    const refreshToken = req.cookies.refreshToken;
    const id = req.user.id;

    try {
      await this.userService.deleteRefreshSession(refreshToken);
      res.status(200).clearCookie('refreshToken');

      this.logger.log(`User logged out successfully. User ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error logging out user. User ID: ${id}, Error: ${error.message}`);
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    const fingerprint = req.fingerprint.hash;
    const currentRefreshToken = req.cookies.refreshToken;

    try {
      const { accessToken, refreshToken, tokenExpiration } = await this.userService.refresh(currentRefreshToken, fingerprint);
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: +process.env.REFRESH_TOKEN_EXPIRATION_15DAYS,
      });

      res.status(200).json({ accessToken, tokenExpiration });

      this.logger.log(`Tokens refreshed successfully. Fingerprint: ${fingerprint}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error refreshing tokens. Fingerprint: ${fingerprint}, Error: ${error.message}`);

      next(error);
    }
  }

  async confirmEmailForRegistration(req: Request, res: Response, next: NextFunction) {
    const token = req.query.token as string;
    const fingerprint = req.fingerprint.hash;

    try {
      const { user, refreshToken } = await this.userService.confirmEmail(token, fingerprint);
      const userResponse = this.userService.buildUserResponse(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
      });

      res.status(200).json(userResponse);

      this.logger.log(`Email for registration confirmed successfully. Token: ${token}, Fingerprint: ${fingerprint}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error confirming email for registration. Token: ${token}, Fingerprint: ${fingerprint}, Error: ${error.message}`);

      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email } = req.body;

    try {
      await this.userService.requestPasswordReset(email);
      res.status(200).send({ message: 'Password reset email sent.' });

      this.logger.log(`Password reset requested successfully. Email: ${email}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error requesting password reset. Email: ${email}, Error: ${error.message}`);

      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    const resetPasswordDto = req.body;
    const token = req.query.token as string;

    try {
      await this.userService.resetPassword(token, resetPasswordDto);
      res.status(200).send({ message: 'Password has been reset.' });

      this.logger.log(`Password reset successfully. Token: ${token}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error resetting password. Token: ${token}, Error: ${error.message}`);

      next(error);
    }
  }

  async googleAuthRedirect(req: Request, res: Response) {
    const token = req.user['accessToken'];
    const host = process.env.HOST;

    return res.redirect(`${host}/users/confirm-google-email?token=${token}`);
  }

  async confirmGoogleEmail(req: Request, res: Response) {
    const token = req.query.token;
    res.status(200).json({ token });
  }

  async successGoogleAuth(req: Request, res: Response, next: NextFunction) {
    const createUserGoogleDto = req.body;

    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${createUserGoogleDto.token}`);
      const { email } = await response.json();
      const fingerprint = req.fingerprint.hash;

      const { user, refreshToken } = await this.userService.finishGoogleAuth(createUserGoogleDto, email, fingerprint);
      const userResponse = this.userService.buildUserResponse(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
      });

      res.status(200).json(userResponse);

      this.logger.log(`Google authentication completed successfully. User Email: ${email}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error during Google authentication. Error: ${error.message}`);

      next(error);
    }
  }
}
