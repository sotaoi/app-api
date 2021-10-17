#!/bin/env node

import { main as apiMain } from '@app/api/main';
import { down } from '@sotaoi/api/db';
import { logger } from '@sotaoi/api/logger';

const main = async (): Promise<void> => {
  try {
    await apiMain(true);
    const downMigrations = (await down())[1];
    !downMigrations.length && (downMigrations[0] = 'No more migrations to rollback');
    logger().info(`\n\nMigrate down command complete:\n${downMigrations.join('\n')}\n`);
    process.exit(0);
  } catch (err) {
    logger().estack(err);
    process.exit(1);
  }
};

main();
