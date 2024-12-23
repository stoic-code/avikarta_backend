import asyncHandler from '../Utils/asyncHandler.util.js';
import ApiError from '../Utils/apiError.util.js';
import { ObjectId } from 'mongodb';
import { Client } from '../Models/client.model.js';
import { Team } from '../Models/team.model.js';
import User from '../Models/user.model.js';

export const selfAssuredReport = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }

        const allMyClients = await Client.find({
            OwnedBy: new ObjectId(String(req.user._id)),
        });

        // self assured
        let totalSelfAssured = 0;
        let totalPremiumAmt = 0;
        // allMyClients.forEach((client, _) => {
        //     totalSelfAssured += client.ClientInsuranceInfo.SumAssured;
        //     totalPremiumAmt += client.ClientInsuranceInfo.PremiumAmount;
        // });

        res.status(200).json({
            clientData: allMyClients.map((client, _) => {
                totalSelfAssured += client.ClientInsuranceInfo.SumAssured;
                totalPremiumAmt += client.ClientInsuranceInfo.PremiumAmount;
                return {
                    clientName: client.FullName,
                    phone: client.Phone,
                    address: `${client.District}, ${client.Municipality}`,
                    sumAssured: client.ClientInsuranceInfo.SumAssured,
                    premium: client.ClientInsuranceInfo.PremiumAmount,
                };
            }),
            totalSelfAssuredAmt: totalSelfAssured,
            totalPremiumAmount: totalPremiumAmt,
            message: 'Self Assured Report submitted successfully. !!',
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

export const primaryMembersReport = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }

        let totalTeamBudget = 0;
        const primaryList = await User.find({
            MyLeader: new ObjectId(String(req.user._id)),
        });

        primaryList.forEach(async (member, _) => {
            console.log(`${member.FullName}:  ${member.SelfAssured}`);
            totalTeamBudget += member.SelfAssured;

            // fetch secondary member:
            await User.find({
                MyLeader: new ObjectId(String(member._id)),
            }).then((Respone) => {
                Respone.forEach((mmember, _) => {
                    console.log(
                        `${member.FullName} 's member: ${mmember.FullName} : ${mmember.SelfAssured}`
                    );
                    totalTeamBudget += mmember.SelfAssured;
                });
            });
        });

        res.status(200).json({
            primaryMembers: primaryList.map((member, _) => {
                return {
                    id: member._id,
                    phone: member.Phone,
                    name: member.FullName,
                    selfAssured: member.SelfAssured,
                };
            }),

            totalBudget: totalTeamBudget,
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

export const secondaryMembersDetail = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }

        const { phone } = req.params;

        // Member Detail
        const Member = await User.findOne({ Phone: phone });

        if (!Member) {
            throw new ApiError(404, 'Member detail fetching failed !! ');
        }

        if (String(Member.MyLeader) !== String(req.user._id)) {
            throw new ApiError(401, "You aren't this member's leader. ");
        }

        // fetch MEMBER's own team detail
        const thatMemberOwnTeam = await Team.findOne({
            TeamLeader: new ObjectId(String(Member._id)),
        });

        // secondary member list handler
        async function handleSecondaryMember(memberList) {
            return Promise.all(
                memberList.map(async (member) => {
                    const response = await User.findOne({
                        Phone: member.Phone,
                    });
                    return {
                        name: response.FullName,
                        phone: response.Phone,
                        selfAssured: response.SelfAssured,
                    };
                })
            );
        }

        if (!thatMemberOwnTeam) {
            res.status(200).json({
                message: 'Member Detail fetched successfully !',
                memberDetail: {
                    fullName: Member.FullName,
                    phone: Member.Phone,
                    teamName: null,
                    myLeader: req.user.FullName,
                },
                memberTeamMember: [],
            });
        } else {
            const teamMembers = await handleSecondaryMember(
                thatMemberOwnTeam.TeamMembers
            );

            res.status(200).json({
                message: 'Member Detail fetched successfully !',
                memberDetail: {
                    fullName: Member.FullName,
                    phone: Member.Phone,
                    teamName: thatMemberOwnTeam.TeamName,
                    myLeader: req.user.FullName,
                },
                memberTeamMember: teamMembers,
            });
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});
