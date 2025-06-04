import bcrypt from 'bcryptjs';
import { UserModel } from './utils/db.js';
import { ask } from './utils/prompt.js';

export const handleRegister = async (rl) => {
  const username = await ask(rl, 'Enter a user name: ');
  const password = await ask(rl, 'Enter your password: ');

  const existing = await UserModel.findOne({ username });
  if (existing) {
    console.log('❌ The user already exists!');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const exampleSecret = 'секретная строка';
  const secretEncrypted = Buffer.from(exampleSecret, 'utf8').toString('base64');

  const user = new UserModel({ username, password: hashedPassword, secret: secretEncrypted });
  await user.save();

  console.log('✅ User registered!');
};
