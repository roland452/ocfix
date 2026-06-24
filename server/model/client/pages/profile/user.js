import mongoose, { model } from "mongoose";


const UserSchema = mongoose.Schema({
    balance: { type: Number, default: 0 },
    escrowBalance: { type: Number, default: 0 },
    email: {type: String, required: true},
    password: { type: String, required: true},
    name: {type: String, default: ""},
    profession: {type: String, default: ""},
    phone: {type: String, default: ""},
    birthdate: {type: Date, default: null},
    image: {type: String, default: ""},
    link: {type: String, default: ""},
    about: {type: String, default: ""},
    status: {type: String},
    isVerified: { type: Boolean, default: false},
    isProfileComplete: { type: Boolean, default: false},
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: String,
    twoFactorExpires: Date,
    sessions: [
        {
            sessionId: { 
                type: String, 
                required: true, 
                unique: true 
            },
            token: { 
                type: String, 
                required: true 
            },
            deviceName: { 
                type: String, 
                default: "Unknown Device" 
            },
                browser: { 
                type: String 
            },
                os: { 
                type: String 
            },
                ipAddress: { 
                type: String 
            },
                location: { 
                type: String, 
                default: "Unknown" 
            },
            lastActive: { 
                type: Date, 
                default: Date.now 
            }
        }
    ],
    webauthnCredentials: [{
        credentialId: { type: String },
        publicKey: { type: String },
        counter: { type: Number, default: 0 },
        deviceType: { type: String }
    }],

    fingerprintEnabled: { 
        type: Boolean, 
        default: false 
    },
    faceDescriptor: {
        type: [Number],
        default: []
    },
    isBiometricallyVerified: {
        type: Boolean,
        default: false
    }
},{ timestamps: true })


export default model('User', UserSchema)

