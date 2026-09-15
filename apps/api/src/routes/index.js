import { Router } from 'express';
import healthCheck from './health-check.js';
import presidentResolve from './presidentResolve.js';
import verifyMember from './verifyMember.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.get('/president/resolve', presidentResolve);
    router.get('/verify/:code', verifyMember);

    return router;
};

