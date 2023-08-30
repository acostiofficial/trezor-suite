import { MiddlewareAPI } from 'redux';
import * as metadataActions from 'src/actions/suite/metadataActions';
import { AppState, Action, Dispatch } from 'src/types/suite';
import { ROUTER } from 'src/actions/suite/constants';
import { accountsActions } from '@suite-common/wallet-core';
import * as discoveryActions from '@suite-common/wallet-core';

let prevState = '';

const metadata =
    (api: MiddlewareAPI<Dispatch, AppState>) =>
    (next: Dispatch) =>
    (action: Action): Action => {
        if (accountsActions.createAccount.match(action)) {
            action.payload = api.dispatch(metadataActions.setAccountMetadataKey(action.payload));
        }

        if (discoveryActions.startDiscovery.match(action)) {
            prevState = JSON.stringify(
                api.dispatch(metadataActions.getLabelableEntitiesDescriptors()),
            );
        }

        // pass action
        next(action);

        switch (action.type) {
            // if labelable entitities differ from previous state after discovery completed init metadata
            // todo: what if I add a hidden wallet but don't run discovery?
            case '@common/wallet-core/discovery/complete': {
                const { device } = api.getState().suite;
                if (api.getState().metadata.enabled && device?.state) {
                    const nextState = JSON.stringify(
                        api.dispatch(metadataActions.getLabelableEntitiesDescriptors()),
                    );
                    if (prevState !== nextState || device.metadata.status === 'disabled') {
                        api.dispatch(metadataActions.init());
                    } else {
                        console.log('states are equal!');
                    }
                }
                break;
            }

            case ROUTER.LOCATION_CHANGE:
                // if there is editing field active, changing route turns it inactive
                if (api.getState().metadata.editing) {
                    api.dispatch(metadataActions.setEditing(undefined));
                }
                break;
            default:
            // no default
        }

        return action;
    };

export default metadata;

// metadata is enabled globally.
// regardless of result, we might now already have some labelable entities.
// TODO: maybe enable only if success?
// TODO: there are other ways how labelable entities may enter stage (wallets).
// TODO: this should be handled in a centralized middleware instead of hooking into other middlewares
//  if (metadataEnabled) {
//     console.log('-init 1');
//     await dispatch(metadataActions.init());
// }
