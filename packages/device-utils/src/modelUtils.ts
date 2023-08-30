import { Device, DeviceModelInternal, models } from '@trezor/connect';

export const getDeviceDisplayName = (deviceModelInternal?: DeviceModelInternal) =>
    deviceModelInternal ? models[deviceModelInternal].name : 'Trezor';

export const getDeviceUnitColor = (device?: Device) => {
    const deviceModelInternal = device?.features?.internal_model;

    const deviceUnitColor = device?.features?.unit_color?.toString();

    if (!deviceModelInternal || !deviceUnitColor) {
        return undefined;
    }

    const deviceInfo = models[deviceModelInternal];

    const { colors } = deviceInfo;

    if (Object.prototype.hasOwnProperty.call(colors, deviceUnitColor)) {
        return (colors as Record<string, string>)[deviceUnitColor].toUpperCase();
    }

    return undefined;
};

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
