import mongoose from "mongoose";
const alertSchema = new mongoose.Schema({
    city: String,
    tempThreshold: Number,
    condition: String,
    isTriggered: Boolean,
  });
  
  export const AlertModel = mongoose.model("Alert", alertSchema);
  