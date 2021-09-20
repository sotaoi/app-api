import { DatabaseConnection } from '@sotaoi/api/db/mdriver';

const repository = 'user';

const up = async (dbConnection: DatabaseConnection): Promise<any> => {
  return dbConnection.schema.createTable(repository, function (table: DatabaseConnection.CreateTableBuilder) {
    table.bigIncrements('id').primary().unsigned();
    table.string('uuid', 36).unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('name').notNullable();
    table.string('avatar').nullable();
    table.timestamp('createdAt').defaultTo(dbConnection.fn.now());
  });
};

const down = async (dbConnection: DatabaseConnection): Promise<any> => {
  return dbConnection.schema.dropTableIfExists(repository);
};

export { up, down };
