import { Model } from '@sotaoi/api/db/model';
import { RecordEntry } from '@sotaoi/omni/artifacts';
import { FieldSchemaInit } from '@sotaoi/api/db/driver';

class UserModel extends Model {
  public hidden(): string[] {
    return ['password'];
  }

  public schema(): FieldSchemaInit {
    return {
      uuid: {
        type: String,
        index: {
          // todo highprio: create unique index
          unique: true,
        },
      },
      email: {
        type: String,
      },
      password: {
        type: String,
      },
      flavor: {
        type: String,
      },
      avatar: {
        type: String,
      },
      asd: {
        type: String,
      },
      gallery: {
        type: String,
      },
      address: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
      updatedAt: {
        type: Date,
      },
    };
  }

  public repository(): string {
    return 'user';
  }

  public async view(user: RecordEntry): Promise<RecordEntry> {
    // todo mediumprio: promise all resolve here (await promise resolve all?)
    await this.with(user, 'address:view');
    return user;
  }
}

export { UserModel };
