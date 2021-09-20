import { RegisterUserHandler } from '@app/api/commands/user/register-user-handler';
import { UpdateUserHandler } from '@app/api/commands/user/update-user-handler';
import { AuthUserHandler } from '@app/api/commands/user/auth-user-handler';
import { QueryAllUsersHandler } from '@app/api/queries/user/query-all-users-handler';
import { RetrieveUserHandler } from '@app/api/queries/user/retrieve-user-handler';
import { RemoveUserHandler } from '@app/api/commands/user/remove-user-handler';

const handlers = {
  user: {
    store: RegisterUserHandler,
    update: UpdateUserHandler,
    query: { 'get-all': QueryAllUsersHandler },
    retrieve: RetrieveUserHandler,
    remove: RemoveUserHandler,
    auth: AuthUserHandler,
  },
};

export { handlers };
