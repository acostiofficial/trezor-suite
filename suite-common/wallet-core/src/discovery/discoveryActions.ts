import { createAction } from '@reduxjs/toolkit';

import { PartialDiscovery } from '@suite-common/wallet-types';

export const discoveryActionsPrefix = '@common/wallet-core/discovery';

export const createDiscovery = createAction(`${discoveryActionsPrefix}/create`, payload => ({
    payload,
}));

export const startDiscovery = createAction(`${discoveryActionsPrefix}/start`, payload => ({
    payload,
}));

export const interruptDiscovery = createAction(`${discoveryActionsPrefix}/interrupt`, payload => ({
    payload,
}));

export const completeDiscovery = createAction(`${discoveryActionsPrefix}/complete`, payload => ({
    payload,
}));

export const stopDiscovery = createAction(`${discoveryActionsPrefix}/stop`, payload => ({
    payload,
}));

export const removeDiscovery = createAction(
    `${discoveryActionsPrefix}/remove`,
    (deviceState: string): { payload: string } => ({
        payload: deviceState,
    }),
);

export const updateDiscovery = createAction(
    `${discoveryActionsPrefix}/update`,
    (payload: PartialDiscovery) => ({ payload }),
);

export const discoveryActions = {
    createDiscovery,
    startDiscovery,
    removeDiscovery,
    updateDiscovery,
    completeDiscovery,
    stopDiscovery,
    interruptDiscovery,
};
