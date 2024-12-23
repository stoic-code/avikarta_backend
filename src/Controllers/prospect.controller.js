import asyncHandler from '../Utils/asyncHandler.util.js';
import ApiError from '../Utils/apiError.util.js';
import { Prospect } from '../Models/prospect.model.js';
import { ObjectId } from 'mongodb';

export const registerProspect = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        console.log('prospect: -----\n', req.user);

        const newProspect = await Prospect.create({
            Prospectedby: req.user._id,
            ...req.body,
        });
        if (newProspect) {
            res.status(200).json({
                data: { user: req.user.FullName, newProspect },
                message: 'Prospect registered successfully. !! 😟',
            });
        } else {
            throw new ApiError(500, 'Prospect registeration failed !! 😖');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

export const getMyPropects = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const { page_no } = req.params;
        const limit = 5;
        const allMyPropects = await Prospect.find({
            Prospectedby: new ObjectId(String(req.user._id)),
        })
            .skip((page_no - 1) * limit)
            .limit(limit);

        if (allMyPropects) {
            res.status(200).json({
                message: 'check out all the prospects !!',
                data: allMyPropects.map((prospect, _) => {
                    return {
                        FullName: prospect.FullName,
                        Avatar: {
                            PublicId: prospect.Avatar.PublicId,
                            SecureURL: prospect.Avatar.SecureURL,
                        },
                        Phone: prospect.Phone,
                        Address: `${prospect.District} ${prospect.Municipality}`,
                        Email: prospect.Email,
                        CreatedAt: prospect.createdAt,
                        _id: prospect.id,
                    };
                }),
            });
        } else {
            throw new ApiError(500, 'Prospect fetch failed !! 😰');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

export const getPropectDetail = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const { prospect_id } = req.params;
        // console.log('id: ', prospect_id);

        const prospectDetail = await Prospect.findById({
            _id: new ObjectId(`${prospect_id}`),
        });

        if (prospectDetail) {
            res.status(200).json({
                data: prospectDetail,
                message: 'prospect detail is submitted successfully !! 🤭',
            });
        } else {
            throw new ApiError(404, 'prospect not found !! 🤔');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

export const updateProspect = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }

        const { prospect_id } = req.params;

        const updatedProspect = await Prospect.findByIdAndUpdate(
            String(prospect_id),
            req.body,
            { new: true, runValidators: true }
        );

        if (updatedProspect) {
            res.status(200).json({
                data: updatedProspect,
                message: 'Prospect updated successfully !! 😏',
            });
        } else {
            throw new ApiError(500, 'Unable to update prospect !! 🧐');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

export const deleteProspect = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const { prospect_id } = req.params;
        const deleteProspect = await Prospect.findByIdAndDelete(
            String(prospect_id)
        );
        res.status(200).json({
            data: deleteProspect,
            message: 'Prospect deleted successfully !! 😆',
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

export const searchProspects = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }

        res.status(200).json({
            data: {},
            message: 'sezrzch result!! 😆',
        });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// registerMeeting
export const registerMeeting = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }

        console.log(req.body);
        const { prospectID, meetingDetail } = req.body;

        // prospect detail
        const PROSPECT = await Prospect.findById(
            new ObjectId(String(prospectID))
        );
        if (!PROSPECT) {
            throw new ApiError(404, 'Prospect not found !! ');
        }

        // adding meeting
        PROSPECT.Meeting.push(meetingDetail);

        // save
        await PROSPECT.save()
            .then((Response) => {
                if (Response) {
                    res.status(200).json({
                        message: `Meeting registered successfully with ${PROSPECT.FullName}.`,
                    });
                }
            })
            .catch((err) => {
                throw new ApiError(
                    415,
                    'Meeting registration failed !! ' + err
                );
            });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// deleteMeeting

export const deleteMeeting = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }

        const { prospect_id, meeting_id } = req.params;
        // console.log('prp id, meet id : ', prospect_id, meeting_id, req.params);

        // prospect detail
        const PROSPECT = await Prospect.findById(
            new ObjectId(String(prospect_id))
        );
        if (!PROSPECT) {
            throw new ApiError(404, 'Prospect not found !!');
        }

        // checking meeting
        const checkingMeeting = PROSPECT.Meeting.find(
            (item) => String(item._id) === String(meeting_id)
        );

        if (!checkingMeeting) {
            throw new ApiError(404, 'Meeting not found!');
        }

        // deletion
        PROSPECT.Meeting = PROSPECT.Meeting.filter(
            (meeting, _) => String(meeting._id) !== String(meeting_id)
        );

        // saving
        await PROSPECT.save()
            .then((Response) => {
                res.status(200).json({
                    message: `Meeting with ${Response.FullName} is removed successfully !! `,
                });
            })
            .catch((err) => {
                throw new ApiError(500, 'Meeting deletion failed !! ');
            });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});
