import React from 'react';
import { ConfirmOnDevice } from './index';
import { StoryColumn } from '../../../support/Story';
import { DeviceModelInternal } from '@trezor/connect';

export default {
    title: 'Misc/Prompts',
    parameters: {
        options: {
            showPanel: false,
        },
    },
};

export const Basic = () => (
    <>
        <StoryColumn minWidth={300}>
            <ConfirmOnDevice
                successText="confirmed"
                title="Confirm on T1"
                deviceModelInternal={DeviceModelInternal.T1B1}
            />
        </StoryColumn>
        <StoryColumn minWidth={300}>
            <ConfirmOnDevice
                successText="confirmed"
                title="Confirm with cancel"
                onCancel={() => {}}
                deviceModelInternal={DeviceModelInternal.T1B1}
            />
        </StoryColumn>
        <StoryColumn minWidth={300}>
            <ConfirmOnDevice
                successText="confirmed"
                title="Confirm on TT"
                deviceModelInternal={DeviceModelInternal.T2T1}
            />
        </StoryColumn>
        <StoryColumn minWidth={300}>
            <ConfirmOnDevice
                successText="confirmed"
                title="With 3 steps no active"
                steps={3}
                deviceModelInternal={DeviceModelInternal.T2T1}
            />
        </StoryColumn>
        <StoryColumn minWidth={300}>
            <ConfirmOnDevice
                successText="confirmed"
                title="With 2 steps no active"
                steps={2}
                deviceModelInternal={DeviceModelInternal.T2T1}
            />
        </StoryColumn>
        <StoryColumn minWidth={300}>
            <ConfirmOnDevice
                successText="confirmed"
                title="With 5 steps - active 4"
                steps={5}
                activeStep={4}
                deviceModelInternal={DeviceModelInternal.T2T1}
            />
        </StoryColumn>
        <StoryColumn minWidth={300}>
            <ConfirmOnDevice
                successText="confirmed"
                title="With 3 steps - active 1"
                steps={3}
                activeStep={1}
                deviceModelInternal={DeviceModelInternal.T2T1}
            />
        </StoryColumn>
        <StoryColumn minWidth={300}>
            <ConfirmOnDevice
                successText="confirmed"
                title="5 steps 3 active cancel"
                steps={5}
                activeStep={3}
                onCancel={() => {}}
                deviceModelInternal={DeviceModelInternal.T2T1}
            />
        </StoryColumn>
        <StoryColumn minWidth={300}>
            <ConfirmOnDevice
                successText="Confirmed"
                title="Confirm on TT"
                steps={5}
                activeStep={5}
                onCancel={() => {}}
                deviceModelInternal={DeviceModelInternal.T2T1}
            />
        </StoryColumn>
    </>
);
