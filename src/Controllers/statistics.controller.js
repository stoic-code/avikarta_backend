import { Client } from '../Models/client.model.js';
import { Prospect } from '../Models/prospect.model.js';
import { Team } from '../Models/team.model.js';
import asyncHandler from '../Utils/asyncHandler.util.js';
import { ObjectId } from 'mongodb';
// stats Number:
/*
1. Total My Clients
2. My total Team member
3. Total My Prospects
4. Total My pending Requests
 */
export const statsNumbers = asyncHandler(async (req, res) => {
    try {
        const USER = req.user;
        if (!USER) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const userID = new ObjectId(String(USER._id));

        // Clients
        const myTotalClients = await Client.find({ OwnedBy: userID });

        // Team Member
        const myTeam = await Team.findOne({
            TeamLeader: userID,
        });
        // Prospects
        const myProspects = await Prospect.find({ Prospectedby: userID });

        // My pending
        const myPendings = 0;

        res.status(200).json({
            data: {
                totalClients: myTotalClients.length,
                totalMyTeamMembers: myTeam ? myTeam.TeamMembers.length : null,
                totalProspects: myProspects.length,
                totalPendings: USER.MyRequests.length,
            },
            message: 'Numbers are sent successfully !!',
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

//sumAssuredStats
export const sumAssuredStats = asyncHandler(async (req, res) => {
    try {
        const USER = req.user;
        if (!USER) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const userID = new ObjectId(String(USER._id));

        // clients
        const myClients = await Client.find({ OwnedBy: userID });

        const stats = myClients.map((client, _) => {
            return {
                date: new Date(client.createdAt).toString(),
                sumAssured: client.ClientInsuranceInfo.SumAssured,
            };
        });

        res.status(200).json({
            data: stats,
            message: 'Sum assured stats sent successfully !!',
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// districtStats
export const districtStats = asyncHandler(async (req, res) => {
    try {
        const USER = req.user;
        if (!USER) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const userID = new ObjectId(String(USER._id));

        const myClientList = await Client.find({ OwnedBy: userID });

        res.status(200).json({
            clients: myClientList.map((client, _) => ({
                districts: client.District,
                value: client.ClientInsuranceInfo.SumAssured,
            })),
            message: 'District stats sent successfully !!',
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// todayMeetings
export const todayMeetings = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }

        res.status(200).json({
            data: {},
            message: 'Today meeting stats sent successfully !!',
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});
