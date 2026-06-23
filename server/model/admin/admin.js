import mongoose, { model } from "mongoose";


const AdminSchema = mongoose.Schema({
    email: {type: String, require: true},
    password: { type: String},
    name: {type: String, default: ""},
    image: {type: String, default: ""},
},{ timestamp: true })


export default model('Admin', AdminSchema)