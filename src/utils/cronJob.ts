import { LessThan } from 'typeorm';
import * as cron from 'node-cron';
import { orderRepository, userRepository } from './initializeRepositories';

cron.schedule('0 0 * * *', async () => {
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() - 15);

  const usersToDelete = await userRepository.find({
    where: {
      isConfirmed: false,
      createdAt: LessThan(expirationDate),
    },
  });

  if (usersToDelete.length > 0) {
    await userRepository.remove(usersToDelete);
  }
});

cron.schedule('0 0 * * *', async () => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - 1);

  const ordersToDelete = await orderRepository.find({
    where: {
      status: 'pending',
      createdAt: LessThan(expirationDate),
    },
  });

  if (ordersToDelete.length > 0) {
    await orderRepository.remove(ordersToDelete);
  }
});
