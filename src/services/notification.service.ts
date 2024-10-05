import * as nodemailer from 'nodemailer';
import { OrderEntity } from '../entities/order.entity';

export class NotificationService {
  private readonly transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
  }

  async sendOrderToMenanger(order: OrderEntity, token: string) {
    let linkToConfirmOrder: string;

    if (order.paymentMethod === 'card') {
      linkToConfirmOrder = 'Order has been confirmed';
    } else {
      linkToConfirmOrder = `link to confirm order:${process.env.CLIENT_URL}confirm/${token}`;
    }

    const books = order.orderedBooks.map((book) => {
      return ` 
     ----------------------- 
     name:${book.title}
     price:${book.originalPrice}
     discounted price:${book.discountedPrice}
     genre:${book.genre}
     category:${book.category} 
     language:${book.language}
     isbn:${book.isbn}
     -----------------------
     `;
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Order',
      text:
        `
            -----------------------------------------
            Name: ${order.username}
            Last name: ${order.lastName}
            Phone number: ${order.phoneNumber}
            Email: ${order.email}
            City: ${order.city}
            Payment method: ${order.paymentMethod}
            Total sum: ${order.totalSum}
            Delivery method: ${order.deliveryMethod}
            Branch address: ${order.branchAddress}
            Total amount: ${order.quantityOfBooks}
            Books:
            ${books}
            ` + linkToConfirmOrder,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(userEmail: string, token: string) {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: userEmail,
      subject: 'Confirm Email Address',
      text: `Please click on the link to confirm email ${process.env.CLIENT_URL}confirm-email?token=${token}`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Confirm Email Address',
      text: `To reset your password, please click the following link: 
             ${process.env.CLIENT_URL}reset-password?token=${token}`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async send(mailOptions) {
    return this.transporter.send(mailOptions);
  }
}

export const notificationService = new NotificationService();
