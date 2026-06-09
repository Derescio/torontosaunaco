import { Schema, model, models } from "mongoose";
import { USER_ROLES } from "@/assets/utils/rbac";

const UserSchema = new Schema({
    
    username: {
        type: String,
    },
    
    email: {
        type: String,
        required: true,
        unique: true,
    },
    
    password: {
        type: String,
    },
   
    isAdmin: {
        type: Boolean,
        default: false,
    },

    role: {
        type: String,
        enum: [USER_ROLES.ADMIN, USER_ROLES.EDITOR, USER_ROLES.MARKETING, USER_ROLES.USER],
        default: USER_ROLES.USER,
        index: true,
    },
    
    image: {
        type: String,
    },
   
    bookmark:[{
        type: Schema.Types.ObjectId,
        ref: "Products",
    }]
},
{
    timestamps: true,
});

UserSchema.pre("save", function syncLegacyAdminFlag() {
    if (this.role === USER_ROLES.ADMIN && !this.isAdmin) {
        this.isAdmin = true;
    }
    if (this.role !== USER_ROLES.ADMIN && this.isAdmin) {
        this.isAdmin = false;
    }
});

const User = models?.User || model("User", UserSchema);
export default User;