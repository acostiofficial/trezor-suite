import type { PROTO } from '../../constants';
import type { Params, Response } from '../params';

export declare function authenticateDevice(
    params: Params<PROTO.AuthenticateDevice>,
): Response<PROTO.AuthenticityProof & { valid: boolean }>;
