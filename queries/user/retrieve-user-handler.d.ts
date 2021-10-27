import { RetrieveHandler } from '@sotaoi/api/queries/retrieve-handler';
import { RetrieveResult } from '@sotaoi/omni/transactions';
import { Retrieve } from '@sotaoi/omni/transactions';
import { UserModel } from '@app/api/models/user-model';
declare class RetrieveUserHandler extends RetrieveHandler {
    model(): Promise<UserModel>;
    handle(retrieve: Retrieve): Promise<RetrieveResult>;
}
export { RetrieveUserHandler };
