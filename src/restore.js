import bcrypt from 'bcryptjs';
import { UserModel } from './utils/db.js';
import { ask } from './utils/prompt.js';

export const handleRestore = async (rl) => {
  const username = await ask(rl, 'Enter a user name: ');
  const user = await UserModel.findOne({ username });

  if (!user) {
    console.log('❌ User not found!');
    return;
  }

  const password = await ask(rl, 'Enter your password: ');
  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    console.log('✅ Access restored!');
    console.log('🔒 Secret (encrypted):', user.secret);
  } else {
    console.log('❌ Wrong password!');
  }
};
