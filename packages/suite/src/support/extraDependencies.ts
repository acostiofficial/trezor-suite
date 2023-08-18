import { saveAs } from 'file-saver';
import { PayloadAction } from '@reduxjs/toolkit';

import { resolveStaticPath } from '@suite-common/suite-utils';
import { getAccountKey } from '@suite-common/wallet-utils';
import type { FiatRatesStateLegacy } from '@suite-common/wallet-types';
import {
    TransactionsState,
    BlockchainState,
    DiscoveryRootState,
    selectDiscoveryByDeviceState,
} from '@suite-common/wallet-core';
import { NetworkSymbol } from '@suite-common/wallet-config';
import { ExtraDependencies } from '@suite-common/redux-utils';

import { StorageLoadAction } from 'src/actions/suite/storageActions';
import * as metadataActions from 'src/actions/suite/metadataActions';
import * as cardanoStakingActions from 'src/actions/wallet/cardanoStakingActions';
import * as walletSettingsActions from 'src/actions/settings/walletSettingsActions';
import { selectIsPendingTransportEvent } from 'src/reducers/suite/deviceReducer';
import { fixLoadedCoinjoinAccount } from 'src/utils/wallet/coinjoinUtils';

import * as suiteActions from '../actions/suite/suiteActions';
import { AppState, ButtonRequest, TrezorDevice } from '../types/suite';
import { STORAGE, SUITE } from '../actions/suite/constants';
import { SuiteState } from '../reducers/suite/suiteReducer';

const connectSrc = resolveStaticPath('connect/');
// 'https://localhost:8088/';
// 'https://connect.corp.sldev.cz/develop/';

const connectInitSettings = {
    connectSrc,
    transportReconnect: true,
    debug: false,
    popup: false,
    manifest: {
        email: 'info@trezor.io',
        appUrl: '@trezor/suite',
    },
};

export const extraDependencies: ExtraDependencies = {
    thunks: {
        cardanoValidatePendingTxOnBlock: cardanoStakingActions.validatePendingTxOnBlock,
        cardanoFetchTrezorPools: cardanoStakingActions.fetchTrezorPools,
        initMetadata: metadataActions.init,
        fetchAndSaveMetadata: metadataActions.fetchAndSaveMetadata,
    },
    selectors: {
        selectFeeInfo: (networkSymbol: NetworkSymbol) => (state: AppState) =>
            state.wallet.fees[networkSymbol],
        selectDevices: (state: AppState) => state.devices,
        selectCurrentDevice: (state: AppState) => state.suite.device,
        selectBitcoinAmountUnit: (state: AppState) => state.wallet.settings.bitcoinAmountUnit,
        selectEnabledNetworks: (state: AppState) => state.wallet.settings.enabledNetworks,
        selectLocalCurrency: (state: AppState) => state.wallet.settings.localCurrency,
        selectIsPendingTransportEvent,
        selectDebugSettings: (state: AppState) => state.suite.settings.debug,
        selectDesktopBinDir: (state: AppState) => state.desktop?.paths?.binDir,
        selectDevice: (state: AppState) => state.suite.device,
        selectMetadata: (state: AppState) => state.metadata,
        selectDiscoveryForDevice: (state: DiscoveryRootState & { suite: SuiteState }) =>
            selectDiscoveryByDeviceState(state, state.suite.device?.state),
        selectRouterApp: (state: AppState) => state.router.app,
    },
    actions: {
        setAccountAddMetadata: metadataActions.setAccountAdd,
        setWalletSettingsLocalCurrency: walletSettingsActions.setLocalCurrency,
        lockDevice: suiteActions.lockDevice,
        appChanged: suiteActions.appChanged,
        setSelectedDevice: suiteActions.setSelectedDevice,
        updateSelectedDevice: suiteActions.updateSelectedDevice,
        requestAuthConfirm: suiteActions.requestAuthConfirm,
    },
    actionTypes: {
        storageLoad: STORAGE.LOAD,
        addButtonRequest: SUITE.ADD_BUTTON_REQUEST,
    },
    reducers: {
        storageLoadBlockchain: (state: BlockchainState, { payload }: StorageLoadAction) => {
            payload.backendSettings.forEach(backend => {
                const blockchain = state[backend.key];
                if (blockchain) {
                    blockchain.backends = backend.value;
                }
            });
        },
        storageLoadTransactions: (state: TransactionsState, { payload }: StorageLoadAction) => {
            const { txs } = payload;
            txs.forEach(item => {
                const k = getAccountKey(item.tx.descriptor, item.tx.symbol, item.tx.deviceState);
                if (!state.transactions[k]) {
                    state.transactions[k] = [];
                }
                state.transactions[k][item.order] = item.tx;
            });
        },
        storageLoadAccounts: (_, { payload }: StorageLoadAction) =>
            payload.accounts.map(acc =>
                acc.backendType === 'coinjoin' ? fixLoadedCoinjoinAccount(acc) : acc,
            ),
        storageLoadFiatRates: (state: FiatRatesStateLegacy, { payload }: StorageLoadAction) => {
            state.coins = payload.fiatRates;
        },
        storageLoadFirmware: (state, { payload }: StorageLoadAction) => {
            if (payload.firmware?.firmwareHashInvalid) {
                state.firmwareHashInvalid = payload.firmware.firmwareHashInvalid;
            }
        },
        storageLoadDiscovery: (_, { payload }: StorageLoadAction) => payload.discovery,
        addButtonRequestFirmware: (
            state,
            {
                payload,
            }: PayloadAction<{
                device?: TrezorDevice;
                buttonRequest: ButtonRequest;
            }>,
        ) => {
            if (payload.buttonRequest?.code === 'ButtonRequest_FirmwareUpdate') {
                state.status = 'waiting-for-confirmation';
            }
        },
    },
    utils: {
        saveAs: (data, fileName) => saveAs(data, fileName),
        connectInitSettings,
    },
};
