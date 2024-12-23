import { Router } from 'express';

import {
    districtStats,
    statsNumbers,
    sumAssuredStats,
    todayMeetings,
} from '../Controllers/statistics.controller.js';

const statsRouter = Router();

statsRouter.route('/numbers').get(statsNumbers);
statsRouter.route('/sum-assured').get(sumAssuredStats);
statsRouter.route('/districts-clf').get(districtStats);

// todays
statsRouter.route('/today-meeting').get(todayMeetings);

export default statsRouter;
