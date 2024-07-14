import { LessThan } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import * as cron from 'node-cron';
import { dataSource } from '../configs/orm.config';
import { logger } from '../logs/logger';
import { OrderEntity } from '../entities/order.entity';

cron.schedule('*/1 * * * *', async () => {
  const userRepository = dataSource.getRepository(UserEntity);
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() - 15);

  const usersToDelete = await userRepository.find({
    where: {
      is_confirmed: false,
      created_at: LessThan(expirationDate),
    },
  });

  if (usersToDelete.length > 0) {
    await userRepository.remove(usersToDelete);
    logger.info(`Deleted unconfirmed users: ${usersToDelete.length}`);
  }
});

cron.schedule('0 0 * * *', async () => {
  const orderRepository = dataSource.getRepository(OrderEntity);
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - 1);

  const ordersToDelete = await orderRepository.find({
    where: {
      status: 'pending',
      created_at: LessThan(expirationDate),
    },
  });

  if (ordersToDelete.length > 0) {
    await orderRepository.remove(ordersToDelete);
    logger.info(`Deleted unconfirmed orders: ${ordersToDelete.length}`);
  }
});
