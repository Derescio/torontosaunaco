import { Schema, model, models } from "mongoose";
import { slugFromName } from "./plugins/slugFromName.js";

const AccessoriesSchema = new Schema({
    
    name: {
        type: String,
        required: true,
        
    },
    image: {
        type: String,
        
    },
    price: {
        type: Number,
       
    },
   
},
{
    timestamps: true,
});

AccessoriesSchema.plugin(slugFromName);

const Accessories = models.Accessories || model("Accessories", AccessoriesSchema);
export default Accessories;