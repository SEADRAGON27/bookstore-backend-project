import { Request } from 'express';
import { JwtDecodedData } from '../types/jwtDecodedData.type';

export interface ExpressRequest extends Request {
  user?: JwtDecodedData;
}
