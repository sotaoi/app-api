import { RemoveHandler } from '@sotaoi/api/commands/remove-handler';
import { CommandResult } from '@sotaoi/omni/transactions';
import { RemoveCommand } from '@sotaoi/api/commands';
import { UserModel } from '@app/api/models/user-model';

class RemoveUserHandler extends RemoveHandler {
  public async model(): Promise<UserModel> {
    return new UserModel();
  }

  public async handle(command: RemoveCommand): Promise<CommandResult> {
    const user = await this.model();
    await user.mdb().where('uuid', command.uuid).delete();

    return new CommandResult(
      200,
      'Removal success',
      'Removal succeeded',
      this.mdriverArtifact('user', command.uuid, {}),
      null,
    );
  }
}

export { RemoveUserHandler };
