import { UserModel } from '@app/api/models/user-model';
import { Model } from '@sotaoi/api/db/model';
import { Helper } from '@sotaoi/api/helper';
import { seedOauthTables } from '@sotaoi/api/db/oauth-tables';
import { config } from '@sotaoi/api/config';

const seed = async (): Promise<any> => {
  const user = new UserModel().mdb();
  const email = 'asd@asd.com';
  if (!(await user.where('email', email).first())) {
    await user.insert({
      uuid: Helper.uuid(),
      email,
      password: Helper.sha1('asdasd'),
      name: 'Asd Com',
      avatar: null,
    });
  }

  await seedOauthTables(Model.mdriver(), config('app.oauth_port'));

  // const user = new UserModel();
  // await user.db().deleteMany({});
  // await user.db().insertMany({
  //   uuid: Helper.uuid(),
  //   email: 'asd@asd.com',
  //   password: 'asdasd',
  //   name: 'Asd Com',
  //   avatar: null,
  // });
};

export { seed };
