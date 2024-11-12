import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { Log } from '../decorators/log.decorator';

export class UserController {
  constructor(private readonly userService: UserService) {}

  @Log({ body: true })
  async createUser(req: Request, res: Response, next: NextFunction) {
    const fingerprint = req.fingerprint.hash;
    const createUserDto = req.body;

    await this.userService.createUser(createUserDto, fingerprint);

    res.status(201).json({ message: 'User registered. Please check your email for the confirmation code.' });
  }

  @Log({ body: true })
  async loginUser(req: Request, res: Response, next: NextFunction) {
    const fingerprint = req.fingerprint.hash;
    const loginUserDto = req.body;

    const { user, refreshToken } = await this.userService.loginUser(loginUserDto, fingerprint);
    const userResponse = this.userService.buildUserResponse(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
    });

    res.status(200).json(userResponse);
  }

  @Log({ user: true })
  async getUser(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.user.id;

    const user = await this.userService.getUser(id);

    res.status(200).json(user);
  }

  @Log({ user: true, body: true })
  async updateUser(req: ExpressRequest, res: Response, next: NextFunction) {
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
      sameSite: 'strict',
      maxAge: +process.env.REFRESH_TOKEN_EXPIRATION_15DAYS,
    });

    res.status(200).json(userResponse);
  }

  @Log({ user: true })
  async deleteUser(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.user.id;

    await this.userService.deleteUser(id);

    res.status(200).send({ message: 'User has been deleted successfully' });
  }

  @Log({ user: true })
  async logoutUser(req: ExpressRequest, res: Response, next: NextFunction) {
    const refreshToken = req.cookies.refreshToken;

    await this.userService.deleteRefreshSession(refreshToken);

    res.status(200).clearCookie('refreshToken');
  }

  @Log({})
  async refresh(req: Request, res: Response, next: NextFunction) {
    const fingerprint = req.fingerprint.hash;
    const currentRefreshToken = req.cookies.refreshToken;

    const { accessToken, refreshToken, tokenExpiration } = await this.userService.refresh(currentRefreshToken, fingerprint);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: +process.env.REFRESH_TOKEN_EXPIRATION_15DAYS,
    });

    res.status(200).json({ accessToken, tokenExpiration });
  }

  @Log({})
  async confirmEmailForRegistration(req: Request, res: Response, next: NextFunction) {
    const token = req.query.token as string;
    const fingerprint = req.fingerprint.hash;

    const { user, refreshToken } = await this.userService.confirmEmail(token, fingerprint);
    const userResponse = this.userService.buildUserResponse(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
    });

    res.status(200).json(userResponse);
  }

  @Log({ body: true })
  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email } = req.body;

    await this.userService.requestPasswordReset(email);

    res.status(200).send({ message: 'Password reset email sent.' });
  }

  @Log({ body: true })
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    const resetPasswordDto = req.body;
    const token = req.query.token as string;

    await this.userService.resetPassword(token, resetPasswordDto);

    res.status(200).send({ message: 'Password has been reset.' });
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

  @Log({ body: true })
  async successGoogleAuth(req: Request, res: Response, next: NextFunction) {
    const createUserGoogleDto = req.body;

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${createUserGoogleDto.token}`);
    const { email } = await response.json();
    const fingerprint = req.fingerprint.hash;

    const { user, refreshToken } = await this.userService.finishGoogleAuth(createUserGoogleDto, email, fingerprint);
    const userResponse = this.userService.buildUserResponse(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_15DAYS),
    });

    res.status(200).json(userResponse);
  }
}
