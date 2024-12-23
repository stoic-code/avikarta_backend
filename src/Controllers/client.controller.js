import asyncHandler from '../Utils/asyncHandler.util.js';
import ApiError from '../Utils/apiError.util.js';
import { Client } from '../Models/client.model.js';
import { ObjectId } from 'mongodb';
import User from '../Models/user.model.js';
import mongoose from 'mongoose';

// register Clients
export const registerClient = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        // console.log(req.body);

        const newClient = await Client.create({
            OwnedBy: req.user._id,
            ...req.body,
        });

        const USER = await User.findById(new ObjectId(String(req.user._id)));

        if (newClient && USER) {
            // agent summ assured update
            USER.SelfAssured += newClient.ClientInsuranceInfo.SumAssured;

            await USER.save();

            // res
            res.status(200).json({
                message:
                    newClient.FullName +
                    ' is registered successfully as your client!!',
            });
        } else {
            throw new ApiError(500, 'Client registration failed !!');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// get Clients
export const getClients = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const { page_no } = req.params;
        const limit = 5;
        const allMyClients = await Client.find({
            OwnedBy: new ObjectId(String(req.user._id)),
        })
            .skip((page_no - 1) * limit)
            .limit(limit);

        if (allMyClients) {
            res.status(200).json({
                message: 'check out the clients !!',
                data: allMyClients.map((client, _) => ({
                    _id: client._id,
                    FullName: client.FullName,
                    Phone: client.Phone,
                    District: `${client.District}, ${client.Municipality}`,
                    Email: client.Email,
                })),
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

// get Client Detail
export const getClientDetail = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const { client_id } = req.params;
        const clientDetail = await Client.findById(
            new ObjectId(String(client_id))
        );
        if (clientDetail) {
            res.status(200).json({
                data: clientDetail,
                message: 'Client detail is submitted successfully !! 🤭',
            });
        } else {
            throw new ApiError(404, 'Client detail not found !!');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// update Client
export const updateClient = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }

        const { client_id } = req.params;

        const updatedClient = await Client.findByIdAndUpdate(
            String(client_id),
            req.body,
            { new: true, runValidators: true }
        );
        if (updatedClient) {
            res.status(200).json({
                data: updatedClient,
                message: 'Client updated successfully !! 😏',
            });
        } else {
            throw new ApiError(500, 'client does not exist to update!!');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// delete client
export const deleteClient = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        const { client_id } = req.params;
        const deletedClient = await Client.findByIdAndDelete(String(client_id));
        if (deletedClient) {
            res.status(200).json({
                message: 'client deleted successfully !! 😆',
                data: deletedClient,
            });
        } else {
            throw new ApiError(404, 'Client not found !!');
        }
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// registerManyClient

export const registerManyClient = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, 'User Session expired!! Try Re Login !');
        }
        // console.log(req.body);
        const data = req.body;

        const manyClient = data.map((item, _) => {
            return {
                OwnedBy: req.user._id,
                ...item,
            };
        });

        const manyClientReg = await Client.insertMany(manyClient)
            .then((response) => {
                if (response) {
                    res.status(200).json({
                        message: 'Many Clients registration successful !',
                    });
                }
            })
            .catch((err) => {
                throw new ApiError(
                    500,
                    'many Clients registration failed !!' + err
                );
            });
    } catch (err) {
        res.status(500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});

// queryClients
export const queryClients = asyncHandler(async (req, res) => {
    try {
        const { fullName, phone, province, district, municipality } = req.query;

        let query = { OwnedBy: new ObjectId(String(req.user._id)) };

        if (fullName) {
            query.FullName = { $regex: fullName, $options: 'i' };
        }

        if (phone) {
            query.Phone = phone;
        }

        if (province) {
            query.Province = province;
        }

        if (district) {
            query.District = district;
        }

        if (municipality) {
            query.Municipality = municipality;
        }

        // console.log('Constructed query:', query);

        const clientsData = await Client.find(query);

        res.status(200).json({
            message: 'Client filtered data submitted successfully !',
            data: clientsData,
        });
    } catch (error) {
        res.status(500).json({
            statusCode: error.statusCode,
            message: error.message,
        });
    }
});
