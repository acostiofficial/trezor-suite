import { createAction } from '@reduxjs/toolkit';

import { Device, DEVICE } from '@trezor/connect';
import { TrezorDevice } from '@suite-common/suite-types';

const MODULE_PREFIX = '@suite/device';

const connectDevice = createAction(DEVICE.CONNECT, (payload: Device) => ({ payload }));

const connectUnacquiredDevice = createAction(DEVICE.CONNECT_UNACQUIRED, (payload: Device) => ({
    payload,
}));

const deviceChanged = createAction(DEVICE.CHANGED, (payload: Device | TrezorDevice) => ({
    payload,
}));

const deviceDisconnect = createAction(DEVICE.DISCONNECT, (payload: Device) => ({ payload }));

const updatePassphraseMode = createAction(
    `${MODULE_PREFIX}/updatePassphraseMode`,
    (payload: { device: TrezorDevice; hidden: boolean; alwaysOnDevice?: boolean }) => ({ payload }),
);

const authFailed = createAction(`${MODULE_PREFIX}/authFailed`, (payload: TrezorDevice) => ({
    payload,
}));

const receiveAuthConfirm = createAction(
    `${MODULE_PREFIX}/receiveAuthConfirm`,
    (payload: { device: TrezorDevice; success: boolean }) => ({ payload }),
);

export const deviceActions = {
    connectDevice,
    connectUnacquiredDevice,
    deviceChanged,
    deviceDisconnect,
    updatePassphraseMode,
    authFailed,
    receiveAuthConfirm,
};
