import mongoose from 'mongoose';

const connectToMongoDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/secureAppDB');
    console.log('✅ Connection to MongoDB is established');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  secret: String
});

const UserModel = mongoose.model('User', UserSchema);

export { connectToMongoDB, UserModel };
