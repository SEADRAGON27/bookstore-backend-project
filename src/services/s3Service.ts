import 'dotenv/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export class S3Service {
  private readonly s3: S3Client;
  private readonly awsBucketName: string;
  private readonly awsRegion: string;

  constructor() {
    this.awsBucketName = process.env.AWS_BUCKET_NAME;
    this.awsRegion = process.env.AWS_REGION;

    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: this.awsRegion,
    });
  }

  async uploadImage(image: Express.Multer.File) {
    const uuid = uuidv4();

    const uploadParams = {
      Bucket: this.awsBucketName,
      Key: image.originalname + uuid,
      Body: image.buffer,
    };

    const command = new PutObjectCommand(uploadParams);

    await this.s3.send(command);

    return `https://s3.${this.awsRegion}.amazonaws.com/${this.awsBucketName}/${image.originalname + uuid}`;
  }

  async deleteImage(imageLink: string) {
    const deleteParams = {
      Bucket: this.awsBucketName,
      Key: imageLink.split('/').pop(),
    };

    const command = new DeleteObjectCommand(deleteParams);
    await this.s3.send(command);
  }
}

export const s3Service = new S3Service();
