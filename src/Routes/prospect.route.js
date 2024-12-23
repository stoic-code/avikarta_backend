import { Router } from 'express';

import {
    registerProspect,
    getPropectDetail,
    getMyPropects,
    updateProspect,
    deleteProspect,
    searchProspects,
    registerMeeting,
    deleteMeeting,
} from '../Controllers/prospect.controller.js';

const prospectRouter = Router();

prospectRouter.route('/new').post(registerProspect);
prospectRouter.route('/all/:page_no').get(getMyPropects);
prospectRouter.route('/:prospect_id').get(getPropectDetail);
prospectRouter.route('/:prospect_id').put(updateProspect);
prospectRouter.route('/:prospect_id').delete(deleteProspect);

prospectRouter.route('/search').get(searchProspects);

// meeting
prospectRouter.route('/meeting/create').post(registerMeeting);
prospectRouter.route('/meeting/:prospect_id/:meeting_id').delete(deleteMeeting);

export default prospectRouter;
