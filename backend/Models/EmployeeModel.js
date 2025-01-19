const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    Defect: {
        type: String,
        required: true
    },
    Weight: {
        type: String,
        required: true
    },
    Breed: {
        type: String,
        required: true
    },
    profileImage: {
        type: String
    },
    Age: {
        type: Number,
        required: true
    },
    production: [
        {
            date: {
                type: Date,
                required: true
            },
            amount: {
                type: Number,
                required: true
            }
        }
    ],
    scale: {
        type: String,
        default: "liter/amount"
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    }
});

const EmployeeModel = mongoose.model('employees', EmployeeSchema);
module.exports = EmployeeModel;
