import { DatabaseConnection } from '@sotaoi/omni/definitions/mdriver';
declare const up: (dbConnection: DatabaseConnection) => Promise<any>;
declare const down: (dbConnection: DatabaseConnection) => Promise<any>;
export { up, down };
