import { DeviceModelInternal, models } from '@trezor/connect';

export const getDeviceDisplayName = (deviceModelInternal?: DeviceModelInternal) =>
    deviceModelInternal ? models[deviceModelInternal].name : 'Trezor';

export const pickByDeviceModel = <Type>(
    deviceModelInternal: DeviceModelInternal | undefined,
    options: {
        default: Type;
        [DeviceModelInternal.T1B1]?: Type;
        [DeviceModelInternal.T2T1]?: Type;
        [DeviceModelInternal.T2B1]?: Type;
    },
): Type => {
    if (!deviceModelInternal || typeof options[deviceModelInternal] === 'undefined') {
        return options.default;
    }

    return options[deviceModelInternal] ?? options.default;
};
