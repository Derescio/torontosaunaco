import mongoose from "mongoose";
import { assertMongoTargetAllowed } from "@/lib/env/safety";

let connected = false;
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }

const connectDB = async () => {
  
    mongoose.set('strictQuery', false);
 
if(connected){
   // console.log('DB already connected')
return;
}
// Outside the try so it isn't swallowed: a redesign build must never touch production data.
assertMongoTargetAllowed(process.env.MONGO_URI ?? "");
try {
    await mongoose.connect(process.env.MONGO_URI);
    connected = true;
    //console.log("DB Connected")
} catch (error) {
    console.log(error)
}
      
};

export default connectDB;