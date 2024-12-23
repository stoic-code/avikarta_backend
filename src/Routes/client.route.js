import { Router } from 'express';
import {
    registerClient,
    getClientDetail,
    getClients,
    updateClient,
    deleteClient,
    registerManyClient,
    queryClients,
} from '../Controllers/client.controller.js';

const clientRouter = Router();

clientRouter.route('/new').post(registerClient);

// insert many
clientRouter.route('/insert_many').post(registerManyClient);

clientRouter.route('/query').get(queryClients);
clientRouter.route('/all/:page_no').get(getClients);
clientRouter.route('/:client_id').get(getClientDetail);
clientRouter.route('/:client_id').put(updateClient);
clientRouter.route('/:client_id').delete(deleteClient);

// client query

export default clientRouter;
