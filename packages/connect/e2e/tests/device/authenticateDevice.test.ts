/* eslint-disable import/no-named-as-default */

import TrezorConnect from '../../../src';

const { getController, setup, initTrezorConnect } = global.Trezor;

const controller = getController();

describe('TrezorConnect.authenticateDevice', () => {
    beforeAll(async () => {
        await setup(controller, {
            mnemonic: 'mnemonic_all',
        });
        await initTrezorConnect(controller);
    });

    afterAll(async () => {
        controller.dispose();
        await TrezorConnect.dispose();
    });

    it('sometimes valid sometimes not, depends on circumstances', async () => {
        const result = await TrezorConnect.authenticateDevice({ challenge: 'aa' });

        if (result.success) {
            expect(typeof result.payload.signature).toEqual('string');
            expect(typeof result.payload.certificate).toEqual('string');
        }
    });
});
