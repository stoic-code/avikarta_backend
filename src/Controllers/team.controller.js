import asyncHandler from '../Utils/asyncHandler.util.js';
import ApiError from '../Utils/apiError.util.js';
import { ObjectId } from 'mongodb';
import { Team } from '../Models/team.model.js';
import User from '../Models/user.model.js';
import sendEmail from '../Utils/sendEmail.util.js';

export const createTeam = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const { TeamName } = req.body;
        const USER = await User.findById(new ObjectId(String(req.user._id)));

        // checking if team name already exist
        const checkingTeam = await Team.findOne({
            TeamLeader: new ObjectId(String(USER._id)),
        });

        if (USER.MyTeam != null) {
            throw new ApiError(409, 'You have already a team : ' + USER.MyTeam);
        }

        if (checkingTeam) {
            throw new ApiError(409, 'You have already created a team ');
        }

        const teamRegistrationDetail = {
            TeamName: TeamName,
            TeamLeader: USER._id,
        };

        USER.MyTeam = TeamName;
        const team = await Team.create(teamRegistrationDetail);
        const user = await USER.save();

        if (team && user) {
            res.status(200).json({
                data: team,
                CreatedBy: user.FullName,
                message: 'Team is registrated successfully !! ',
            });
        } else {
            throw new ApiError(403, 'Team registration failed !!');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

export const addTeamMember = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const { Phone } = req.body;
        const user = req.user;

        if (user.Phone === Phone) {
            throw new ApiError(409, "You can't request to yourself");
        }

        // fetch adding member detail
        const addingMember = await User.findOne({
            Phone: Phone,
        });

        if (!addingMember) {
            throw new ApiError(404, 'Requested Member does not exist.');
        }

        // checking if on another team already
        if (addingMember.MyLeader != null) {
            throw new ApiError(
                409,
                `${addingMember.FullName} is already on another team.`
            );
        }

        // fetch team detail
        const teamDetail = await Team.findOne({
            TeamLeader: new ObjectId(String(user._id)),
        });

        if (!teamDetail) {
            throw new ApiError(404, 'Your team is not found.');
        }

        // Check if the member is already in the team
        const isMemberAlreadyInHisRequestList = addingMember.MyRequests.some(
            (member) => member.RequestPhone === user.Phone
        );

        if (isMemberAlreadyInHisRequestList) {
            throw new ApiError(
                400,
                'You have already sent request to ' + addingMember.FullName
            );
        }

        addingMember.MyRequests.push({
            teamName: teamDetail.TeamName,
            teamId: teamDetail._id,
            Requestedby: user.FullName,
            Phone: user.Phone,
        });

        // Check if the member is already in the team
        const isMemberAlreadyInTeam = teamDetail.TeamMembers.some(
            (member) => member.Phone === Phone
        );

        if (isMemberAlreadyInTeam) {
            throw new ApiError(400, 'Member is already part of the team.');
        }

        // Add the member to the team's TeamMembers array with default MembershipStatus: "pending"
        teamDetail.TeamMembers.push({
            FullName: addingMember.FullName,
            Phone: addingMember.Phone,
            Address: addingMember.Municipality + ', ' + addingMember.District,
            Email: addingMember.Email,
            SelfAssured: addingMember.SelfAssured,
        });

        // Save the updated team and addingMember data
        const toTheTeam = await teamDetail.save();
        const toTheRequest = await addingMember.save();
        if (toTheRequest && toTheTeam) {
            // send mail to the requested person
            // const message = `Dear ${addingMember.FullName}, \n\n ${user.FullName} sent you membership to join his team: " ${teamDetail.TeamName} "`;

            // await sendEmail({
            //     email: addingMember.Email,
            //     subject: `AVIKARTA: ${user.FullName} sent you membership request. `,
            //     mailContent: message,
            // });

            res.status(200).json({
                message: `Membership request is sent to the ${addingMember.FullName} successfully !!`,
            });
        } else {
            throw new ApiError(500, 'Membership process failed !! ');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

export const getTeamDetail = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }

        const teamDetail = await Team.findOne({
            TeamLeader: new ObjectId(String(req.user._id)),
        });

        if (String(req.user._id) === String(teamDetail.TeamLeader)) {
            res.status(200).json({
                message: 'Team detail submitted successfully!!',
                data: teamDetail,
            });
        } else {
            throw new ApiError(
                404,
                'Your are not leader of request team detail !'
            );
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// getTeamMemberDetail: to get team member's detail

export const getTeamMemberDetail = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }

        const { MemberPhone } = req.body;

        // Member Detail
        const Member = await User.findOne({ Phone: MemberPhone });

        if (String(Member.MyLeader) !== String(req.user._id)) {
            throw new ApiError(401, "You aren't this member's leader. ");
        }

        if (!Member) {
            throw new ApiError(404, 'Member detail fetching failed !! ');
        }

        // fetch MEMBER's own team detail
        const thatMemberOwnTeam = await Team.findOne({
            TeamLeader: new ObjectId(String(Member._id)),
        });
        if (!thatMemberOwnTeam) {
            res.status(200).json({
                message: 'Member Detail fetched successfully !',
                memberDetail: {
                    fullName: Member.FullName,
                    address: `${Member.District}, ${Member.Municipality}`,
                    dob: Member.DateOfBirth,
                    contact: Member.Phone,
                    email: Member.Email,
                    teamName: null,
                    myLeader: req.user.FullName,
                },
                memberTeamMember: [],
            });
        } else {
            res.status(200).json({
                message: 'Member Detail fetched successfully !',
                memberDetail: {
                    fullName: Member.FullName,
                    address: `${Member.District}, ${Member.Municipality}`,
                    dob: Member.DateOfBirth,
                    contact: Member.Phone,
                    email: Member.Email,
                    teamName: thatMemberOwnTeam.TeamName,
                    myLeader: req.user.FullName,
                },
                memberTeamMember: thatMemberOwnTeam.TeamMembers,
            });
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

export const teamRequestAcceptHandler = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const { TeamName } = req.body;

        const USER = await User.findById(req.user._id);

        if (USER.MyRequests.length === 0) {
            throw new ApiError(404, 'You have no requeset !!');
        }

        // team detail fetch
        const teamDetail = await Team.findOne({ TeamName: TeamName });
        if (!teamDetail) {
            throw new ApiError(404, 'Team is not found !');
        }

        let confirmed = false;
        teamDetail.TeamMembers.forEach((element) => {
            if (
                element.Phone === USER.Phone &&
                element.MembershipStatus === 'pending'
            ) {
                element.MembershipStatus = 'confirmed';
                USER.MyLeader = teamDetail.TeamLeader;
                confirmed = true;
            }
        });

        // console.log('stage 2: ', teamDetail);
        if (confirmed) {
            const team = await teamDetail.save();
            const user = await USER.save();

            res.status(200).json({
                message: 'You are in ' + team.TeamName + ' now. ',
                data: {
                    Team: `You are in Team: ${team.TeamName}`,
                    user: user,
                },
            });
            await sendEmail({
                // email: ,
                subject: `AVIKARTA: ${user.FullName} sent you membership request. `,
                mailContent: message,
            });
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// deleteMembershipRequest
export const deleteMembershipRequest = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        // console.log('teamname delete:', req.body);

        const { TeamName } = req.body;

        const USER = await User.findById(req.user._id);

        if (USER.MyRequests.length === 0) {
            throw new ApiError(404, 'You have no requeset !!');
        }

        // team detail fetch
        const teamDetail = await Team.findOne({ TeamName: TeamName });
        if (!teamDetail) {
            throw new ApiError(404, 'Team is not found !');
        }

        // team flush
        teamDetail.TeamMembers = teamDetail.TeamMembers.filter(
            (member) =>
                member.Phone != USER.Phone &&
                member.MembershipStatus != 'pending'
        );

        // my request flush
        USER.MyRequests = USER.MyRequests.filter(
            (item, _) => item.teamName !== TeamName
        );

        // saving
        await teamDetail.save();
        await USER.save();

        res.status(200).json({
            message: 'Request deleted successfully !!',
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});
