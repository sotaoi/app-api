import { StoreHandler } from '@sotaoi/api/commands/store-handler';
import { CommandResult } from '@sotaoi/omni/transactions';
import { StoreCommand } from '@sotaoi/api/commands';
import { UserModel } from '@app/api/models/user-model';
declare class RegisterUserHandler extends StoreHandler {
    getFormId: () => Promise<string>;
    model(): Promise<UserModel>;
    handle(command: StoreCommand): Promise<CommandResult>;
}
export { RegisterUserHandler };
