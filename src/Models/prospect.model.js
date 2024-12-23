import mongoose from 'mongoose';
import validator from 'validator';

const prospectSchema = new mongoose.Schema(
    {
        Prospectedby: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        FullName: {
            type: String,
            required: [true, 'Please enter full name !'],
            trim: true,
            index: true,
        },
        Phone: {
            type: String,
            required: [true, 'Please enter phone number. !!'],
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
            index: true,
            validate: [validator.isEmail, 'Enter Valid email !'],
        },
        SumExpected: {
            type: Number,
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
            required: [true, 'Please select municipality!'],
        },
        Avatar: {
            PublicId: String,
            SecureURL: String,
        },
        Meeting: [
            {
                MeetingDate: String,
                MeetingTitle: String,
                Purpose: String,
                WhatTheySaid: String,
                FollowUp: String,
                Time: String,
                Remark: String,
            },
        ],
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

export const Prospect = mongoose.model('Prospect', prospectSchema);
