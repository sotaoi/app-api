import { CommandResult } from '@sotaoi/omni/transactions';
import { UpdateCommand } from '@sotaoi/api/commands';
import { UpdateHandler } from '@sotaoi/api/commands/update-handler';
import { storage } from '@sotaoi/api/storage';
import { UserModel } from '@app/api/models/user-model';

class UpdateUserHandler extends UpdateHandler {
  public getFormId = async (): Promise<string> => 'user-update-form';

  public async model(): Promise<UserModel> {
    return new UserModel();
  }

  public async handle(command: UpdateCommand): Promise<CommandResult> {
    const { email, name, avatar } = command.payload;

    const [saveAvatar, avatarAsset, removeAvatar] = storage('main').handle(
      {
        domain: 'public',
        pathname: ['user', command.uuid, 'avatar.png'].join('/'),
      },
      avatar,
    );

    const payload: { [key: string]: any } = {};
    typeof email !== 'undefined' && (payload.email = email.serialize(true));
    typeof name !== 'undefined' && (payload.name = name ? name.serialize(true) : '');
    typeof avatar !== 'undefined' && (payload.avatar = avatarAsset?.serialize(true));

    Object.keys(payload).length && (await new UserModel().mdb().where('uuid', command.uuid).update(payload));
    typeof avatar !== 'undefined' && (avatar ? saveAvatar() : removeAvatar());

    return new CommandResult(200, 'Hello', 'Command test', this.mdriverArtifact('user', command.uuid, {}), null);
  }

  protected refreshArtifact(): boolean {
    return true;
  }
}

export { UpdateUserHandler };
