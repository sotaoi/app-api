import { CommandResult } from '@sotaoi/omni/transactions';
import { UpdateCommand } from '@sotaoi/api/commands';
import { UpdateHandler } from '@sotaoi/api/commands/update-handler';
import { UserModel } from '@app/api/models/user-model';
declare class UpdateUserHandler extends UpdateHandler {
    getFormId: () => Promise<string>;
    model(): Promise<UserModel>;
    handle(command: UpdateCommand): Promise<CommandResult>;
    protected refreshArtifact(): boolean;
}
export { UpdateUserHandler };
