import { main as apiMain } from '@app/api/main';
import { migrate } from '@sotaoi/api/db';
import { logger } from '@sotaoi/api/logger';

const main = async (): Promise<void> => {
  try {
    await apiMain(true);
    const migrations = (await migrate())[1];
    !migrations.length && (migrations[0] = 'No new migrations');
    logger().info(`\n\nMigrate command complete:\n${migrations.join('\n')}\n`);
    process.exit(0);
  } catch (err) {
    logger().estack(err);
    process.exit(1);
  }
};

main();
