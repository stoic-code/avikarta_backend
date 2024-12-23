import { Router } from 'express';

import {
    primaryMembersReport,
    secondaryMembersDetail,
    selfAssuredReport,
} from '../Controllers/report.controller.js';

const reportRouter = Router();

reportRouter.route('/self-assured-report').get(selfAssuredReport);

// team reporting
reportRouter.route('/primary-member-report').get(primaryMembersReport);
reportRouter
    .route('/secondary-member-report/:phone')
    .get(secondaryMembersDetail);

export default reportRouter;
