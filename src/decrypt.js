import { UserModel } from './utils/db.js';
import { ask } from './utils/prompt.js';

export const handleDecrypt = async (rl) => {
  const username = await ask(rl, 'Enter a user name: ');
  const user = await UserModel.findOne({ username });

  if (!user || !user.secret) {
    console.log('❌ The user is not found or does not have a secret.');
    return;
  }

  const decoded = Buffer.from(user.secret, 'base64').toString('utf8');
  console.log('🔓 Decoded string:', decoded);
};
