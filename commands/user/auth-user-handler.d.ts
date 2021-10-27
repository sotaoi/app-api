import { AuthResult } from '@sotaoi/omni/transactions';
import { AuthCommand } from '@sotaoi/api/commands';
import { AuthHandler } from '@sotaoi/api/commands/auth-handler';
import { UserModel } from '@app/api/models/user-model';
declare class AuthUserHandler extends AuthHandler {
    getFormId: () => Promise<string>;
    model(): Promise<UserModel>;
    handle(command: AuthCommand): Promise<AuthResult>;
}
export { AuthUserHandler };
