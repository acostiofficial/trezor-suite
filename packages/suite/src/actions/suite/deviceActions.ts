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

const createDeviceInstance = createAction(
    `${MODULE_PREFIX}/createDeviceInstance`,
    (payload: TrezorDevice) => ({ payload }),
);

const rememberDevice = createAction(
    `${MODULE_PREFIX}/rememberDevice`,
    (payload: { device: TrezorDevice; remember: boolean; forceRemember: undefined | true }) => ({
        payload,
    }),
);

const forgetDevice = createAction(`${MODULE_PREFIX}/forgetDevice`, (payload: TrezorDevice) => ({
    payload,
}));

const authDevice = createAction(
    `${MODULE_PREFIX}/authDevice`,
    (payload: { device: TrezorDevice; state: string }) => ({ payload }),
);

export const deviceActions = {
    connectDevice,
    connectUnacquiredDevice,
    deviceChanged,
    deviceDisconnect,
    updatePassphraseMode,
    authFailed,
    receiveAuthConfirm,
    createDeviceInstance,
    rememberDevice,
    forgetDevice,
    authDevice,
};
