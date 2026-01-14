import { NestFactory } from '@nestjs/core';
import { SagaModule } from './saga.module';
import { SosCreationActivity } from './activities';
import { Worker } from '@temporalio/worker';

async function run() {
  const app = await NestFactory.createApplicationContext(SagaModule);
  const activitiesInstance = app.get(SosCreationActivity);

  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflow'),
    activities: {
      changeBikeStatus:
        activitiesInstance.changeBikeStatus.bind(activitiesInstance),
      createSos: activitiesInstance.createSos.bind(activitiesInstance),
      deleteSos: activitiesInstance.deleteSos.bind(activitiesInstance),
    },
    taskQueue: 'sos-creation',
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
