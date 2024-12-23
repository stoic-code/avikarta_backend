import mongoose from 'mongoose';
// import { User } from './user.model.js';
import validator from 'validator';

const clientSchema = new mongoose.Schema(
    {
        OwnedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        FullName: {
            type: String,
            required: [true, 'Please enter your full name !'],
            trim: true,
            index: true,
        },
        Phone: {
            type: String,
            required: [true, 'Please enter your phone number. !!'],
            maxLength: [15, 'Invalid Phone Number Length !!'],
            minLength: [10, 'Invalid Phone Number Length !!'],
            trim: true,
            index: true,
        },
        DateOfBirth: {
            type: String,
            required: [true, 'Please provide the Date of Birth'],
        },
        Email: {
            type: String,
            trim: true,
            validate: [validator.isEmail, 'Enter Valid email !'],
        },
        Province: {
            type: String,
            required: [true, 'Please select province !'],
        },
        District: {
            type: String,
            required: [true, 'Please select district !'],
        },
        Municipality: {
            type: String,
            required: [true, 'Please select municipality !'],
        },
        Avatar: {
            PublicId: String,
            SecureURL: String,
        },

        ClientInsuranceInfo: {
            NameOfNominee: {
                type: String,
                required: [true, 'Please enter your full name !'],
                trim: true,
                index: true,
            },
            NomineePhone: {
                type: String,
                required: [true, 'Please enter your phone number. !!'],
                maxLength: [15, 'Invalid Phone Number Length !!'],
                minLength: [10, 'Invalid Phone Number Length !!'],
                trim: true,
            },
            Relationship: {
                type: String,
                required: [true, 'Please mention relation'],
            },
            SumAssured: {
                type: Number,
                required: [true, 'Sum Assured cannot be empty.'],
            },
            PremiumAmount: {
                type: Number,
                required: [true, 'Premium Amount cannot be empty.'],
            },
            PolicyNo: {
                type: Number,
                required: [true, 'Policy Number cannot be empty. '],
                unique: [true, 'Policy Number should be unique'],
            },
            PolicyType: {
                type: Number,
                required: [true, 'Type of Policy cannot be empty'],
            },
            IssueDate: {
                type: Date,
                required: [true, 'Issue Date cannot be empty. '],
            },
            EndDate: {
                type: Date,
                required: [true, 'End Date cannot be empty. '],
            },
            LastPaymentDate: {
                type: Date,
                required: [true, 'End Date cannot be empty. '],
            },
            PaymentMethod: {
                type: String,
                required: [true, 'Please select Payment Method'],
            },
            LoanFacilities: {
                type: Boolean,
                default: false,
            },
            PolicyIssueBranch: {
                type: String,
                default: [true, 'Please enter a policy issue branch name'],
            },
            PhotoOfPolicy: {
                PublicId: String,
                SecureURL: String,
            },
            PolicyFileReceivedBy: {
                type: String,
                required: [true, 'Who received policy file is empty. '],
            },
            PolicyFileReceivedDate: {
                type: Date,
                required: [true, 'Policy File Received Date cannot be empty'],
            },
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.__v;
            },
        },
        timestamps: true,
    }
);

export const Client = mongoose.model('Client', clientSchema);
