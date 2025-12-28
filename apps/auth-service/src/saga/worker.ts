import { NestFactory } from '@nestjs/core';
import { SagaModule } from './saga.module';
import { UserCreationActivity } from './activities';
import { Worker } from '@temporalio/worker';

async function run() {
  const app = await NestFactory.createApplicationContext(SagaModule);
  const activitiesInstance = app.get(UserCreationActivity);

  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflow'),
    activities: {
      createUserProfile:
        activitiesInstance.createUserProfile.bind(activitiesInstance),
      createWallet: activitiesInstance.createWallet.bind(activitiesInstance),
      sendWelcomeEmail:
        activitiesInstance.sendWelcomeEmail.bind(activitiesInstance),
      deleteUserProfile:
        activitiesInstance.deleteUserProfile.bind(activitiesInstance),
      deleteAccount: activitiesInstance.deleteAccount.bind(activitiesInstance),
    },
    taskQueue: 'user-creation',
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
