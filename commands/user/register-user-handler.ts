import { StoreHandler } from '@sotaoi/api/commands/store-handler';
import { CommandResult } from '@sotaoi/omni/transactions';
import { StoreCommand } from '@sotaoi/api/commands';
import { Helper } from '@sotaoi/api/helper';
import { storage } from '@sotaoi/api/storage';
import { UserModel } from '@app/api/models/user-model';
import { AuthHandler } from '@sotaoi/api/commands/auth-handler';
import { storeAuthorization } from '@app/api/auth/oauth-authorize';

class RegisterUserHandler extends StoreHandler {
  public getFormId = async (): Promise<string> => 'user-register-form';

  public async model(): Promise<UserModel> {
    return new UserModel();
  }

  public async handle(command: StoreCommand): Promise<CommandResult> {
    const { email, password, name, avatar } = command.payload;

    const userUuid = Helper.uuid();
    const [saveAvatar, avatarAsset, cancelAvatar] = storage('main').handle(
      { domain: 'public', pathname: ['user', userUuid, 'avatar.png'].join('/') },
      avatar,
    );
    await new UserModel().mdb().insert({
      uuid: userUuid,
      email: email.serialize(true),
      password: Helper.sha1(password.serialize(true)),
      name: name ? name.serialize(true) : '',
      avatar: avatarAsset.serialize(true),
    });
    saveAvatar();

    const accessToken = Helper.uuid();
    const user = await new UserModel().mdb().where('uuid', userUuid).first();
    const authRecord = this.mdriverAuthRecord('user', userUuid, user.createdAt, true, { accessToken });
    const tokenTtl = AuthHandler.getTokenTtlInSeconds();

    if (
      !(await storeAuthorization(
        this.handler,
        authRecord,
        this.mdriverDomainRepoSignature('user'),
        accessToken,
        true,
        tokenTtl,
      ))
    ) {
      return new CommandResult(400, 'Error', 'User registered, but authentication failed', null, null);
    }

    return new CommandResult(200, 'Hello', 'You are authenticated', authRecord, null);
  }
}

export { RegisterUserHandler };
