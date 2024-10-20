import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    const dbURI = process.env.DB_URI; // Ensure this matches your .env variable
    if (!dbURI) {
      throw new Error(
        "Database URI is not defined in the environment variables."
      );
    }
    await mongoose.connect(dbURI, {
      //useNewUrlParser: true,
      //useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
  }
};

export default connectDatabase;
