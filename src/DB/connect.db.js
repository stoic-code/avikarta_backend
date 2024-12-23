import mongoose from "mongoose";

const mongdbApi = async () => {
  try {
    // console.log(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`-->R: Successfully connected to db !!`);
  } catch (error) {
    console.log("-->E: DB API connect: \n", error);
    process.exit(1);
  }
};

export default mongdbApi;
