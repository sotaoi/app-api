import { RemoveHandler } from '@sotaoi/api/commands/remove-handler';
import { CommandResult } from '@sotaoi/omni/transactions';
import { RemoveCommand } from '@sotaoi/api/commands';
import { UserModel } from '@app/api/models/user-model';
declare class RemoveUserHandler extends RemoveHandler {
    model(): Promise<UserModel>;
    handle(command: RemoveCommand): Promise<CommandResult>;
}
export { RemoveUserHandler };
