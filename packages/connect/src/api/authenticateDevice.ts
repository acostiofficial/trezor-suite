import { AbstractMethod } from '../core/AbstractMethod';
import { validateParams } from './common/paramsValidator';
import { PROTO } from '../constants';
import { getRandomChallenge, verifyAuthenticityProof } from './firmware/verifyAuthenticityProof';

export default class AuthenticateDevice extends AbstractMethod<
    'authenticateDevice',
    PROTO.AuthenticateDevice
> {
    init() {
        this.useEmptyPassphrase = true;
        this.requiredPermissions = ['management'];
        this.useDeviceState = false;

        const { payload } = this;

        // TODO validate firmware/model version

        validateParams(payload, [{ name: 'challenge', type: 'string' }]);

        this.params = {
            challenge: payload.challenge,
        };
    }

    async run() {
        // const challenge = this.params.challenge
        //     ? Buffer.from(this.payload.challenge)
        //     : getRandomChallenge();

        const challenge = getRandomChallenge();

        const { message } = await this.device
            .getCommands()
            .typedCall('AuthenticateDevice', 'AuthenticityProof', {
                challenge: challenge.toString('hex'),
            });

        const caPublicKeys = [
            '0423a5c9ec44dfb96023838d958f6289fa611277ee7af60c3bcb54eff2310546d5ece48b1a507503142b122b53eda53fef3f3d3510f3b7ae2fd5f13614b025ede1',
        ];

        const valid = await verifyAuthenticityProof({
            ...message,
            challenge,
            caPublicKeys,
        });

        return { ...message, valid };
    }
}
