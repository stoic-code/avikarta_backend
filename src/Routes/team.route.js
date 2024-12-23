import { Router } from 'express';

import {
    createTeam,
    addTeamMember,
    getTeamDetail,
    teamRequestAcceptHandler,
    deleteMembershipRequest,
    getTeamMemberDetail,
} from '../Controllers/team.controller.js';

const teamRouter = Router();

teamRouter.route('/register-team').post(createTeam);

teamRouter.route('/add-member').post(addTeamMember);

teamRouter.route('/team-detail').get(getTeamDetail);

teamRouter.route('/team-member-detail').post(getTeamMemberDetail);

teamRouter.route('/team-request-accept').patch(teamRequestAcceptHandler);

teamRouter.route('/team-request-cancel').delete(deleteMembershipRequest);

export default teamRouter;
