import { DatabaseConnection } from '@sotaoi/omni/definitions/mdriver';
import { migrateOauthTables, rollbackOauthTables } from '@sotaoi/api/db/oauth-tables';

const up = async (dbConnection: DatabaseConnection): Promise<any> => {
  await migrateOauthTables(dbConnection);
};

const down = async (dbConnection: DatabaseConnection): Promise<any> => {
  await rollbackOauthTables(dbConnection);
};

export { up, down };
