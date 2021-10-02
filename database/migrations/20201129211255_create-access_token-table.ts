import { DatabaseConnection } from '@sotaoi/omni/definitions/mdriver';
import { migrateAccessTokenTable, rollbackAccessTokenTable } from '@sotaoi/api/db/access_token-table';

const up = async (dbConnection: DatabaseConnection): Promise<any> => {
  await migrateAccessTokenTable(dbConnection);
};

const down = async (dbConnection: DatabaseConnection): Promise<any> => {
  await rollbackAccessTokenTable(dbConnection);
};

export { up, down };
