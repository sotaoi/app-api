import { Model } from '@sotaoi/api/db/model';
import { RecordEntry } from '@sotaoi/omni/artifacts';
import { FieldSchemaInit } from '@sotaoi/api/db/driver';
declare class UserModel extends Model {
    hidden(): string[];
    schema(): FieldSchemaInit;
    repository(): string;
    view(user: RecordEntry): Promise<RecordEntry>;
}
export { UserModel };
