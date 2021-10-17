#!/bin/env node

import { main as apiMain } from '@app/api/main';
import { seed } from '@sotaoi/api/db';
import { logger } from '@sotaoi/api/logger';

const main = async (): Promise<void> => {
  try {
    await apiMain(true);
    const seeds = (await seed())[0];
    !seeds.length && (seeds[0] = 'No seed files');
    logger().info(`\n\nSeeding complete:\n${seeds.join('\n')}\n`);
    process.exit(0);
  } catch (err) {
    logger().estack(err);
    process.exit(1);
  }
};

main();
