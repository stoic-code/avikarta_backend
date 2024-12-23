import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
    {
        TeamName: {
            type: String,
            required: [true, 'Team Name is necessary !'],
            trim: true,
            index: true,
            unique: [true, 'Team Name is already taken !'],
        },
        TeamMembers: [
            {
                FullName: String,
                Phone: String,
                Address: String,
                Email: String,
                MembershipStatus: {
                    type: String,
                    default: 'pending',
                },
            },
        ],
        TeamLeader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "TeamLeader can't be empty !"],
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

export const Team = mongoose.model('Team', teamSchema);
