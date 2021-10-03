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
          unique: true,
        },
      },
      email: {
        type: String,
      },
      name: {
        type: String,
      },
      password: {
        type: String,
      },
      avatar: {
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
    await this.with(user, 'address:view');
    return user;
  }
}

export { UserModel };
