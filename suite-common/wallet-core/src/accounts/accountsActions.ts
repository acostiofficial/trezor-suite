import { createAction } from '@reduxjs/toolkit';

import { AccountInfo } from '@trezor/connect';
import { Account, SelectedAccountStatus, DiscoveryItem } from '@suite-common/wallet-types';
import {
    enhanceAddresses,
    enhanceTokens,
    enhanceUtxo,
    formatNetworkAmount,
    getAccountKey,
    getAccountSpecific,
} from '@suite-common/wallet-utils';

import { accountActionsPrefix } from './constants';

const disposeAccount = createAction(`${accountActionsPrefix}/disposeAccount`);

const updateSelectedAccount = createAction(
    `${accountActionsPrefix}/updateSelectedAccount`,
    (payload: SelectedAccountStatus): { payload: SelectedAccountStatus } => ({
        payload,
    }),
);

const removeAccount = createAction(
    `${accountActionsPrefix}/removeAccount`,
    (payload: Account[]): { payload: Account[] } => ({
        payload,
    }),
);

const createAccount = createAction(
    `${accountActionsPrefix}/createAccount`,
    (
        deviceState: string,
        discoveryItem: DiscoveryItem,
        accountInfo: AccountInfo,
        imported?: boolean,
        accountLabel?: string,
    ): { payload: Account } => ({
        payload: {
            deviceState,
            index: discoveryItem.index,
            path: discoveryItem.path,
            unlockPath: discoveryItem.unlockPath,
            descriptor: accountInfo.descriptor,
            key: getAccountKey(accountInfo.descriptor, discoveryItem.coin, deviceState),
            accountType: discoveryItem.accountType,
            symbol: discoveryItem.coin,
            empty: accountInfo.empty,
            ...(discoveryItem.backendType === 'coinjoin'
                ? {
                      backendType: 'coinjoin',
                      status: discoveryItem.status,
                  }
                : {
                      backendType: discoveryItem.backendType,
                  }),
            visible:
                !accountInfo.empty ||
                discoveryItem.accountType === 'coinjoin' ||
                (discoveryItem.accountType === 'normal' && discoveryItem.index === 0),
            balance: accountInfo.balance,
            availableBalance: accountInfo.availableBalance,
            formattedBalance: formatNetworkAmount(
                // xrp `availableBalance` is reduced by reserve, use regular balance
                discoveryItem.networkType === 'ripple'
                    ? accountInfo.balance
                    : accountInfo.availableBalance,
                discoveryItem.coin,
            ),
            tokens: enhanceTokens(accountInfo.tokens),
            addresses: enhanceAddresses(accountInfo, discoveryItem),
            utxo: enhanceUtxo(accountInfo.utxo, discoveryItem.networkType, discoveryItem.index),
            history: accountInfo.history,
            metadata: {
                key: accountInfo.legacyXpub || accountInfo.descriptor,
            },
            accountLabel,
            imported,
            ...getAccountSpecific(accountInfo, discoveryItem.networkType),
        },
    }),
);

const updateAccount = createAction(
    `${accountActionsPrefix}/updateAccount`,
    (account: Account, accountInfo: AccountInfo | null = null): { payload: Account } => {
        if (accountInfo) {
            return {
                payload: {
                    ...account,
                    ...accountInfo,
                    path: account.path,
                    empty: accountInfo.empty,
                    visible: account.visible || !accountInfo.empty,
                    formattedBalance: formatNetworkAmount(
                        // xrp `availableBalance` is reduced by reserve, use regular balance
                        account.networkType === 'ripple'
                            ? accountInfo.balance
                            : accountInfo.availableBalance,
                        account.symbol,
                    ),
                    utxo: enhanceUtxo(accountInfo.utxo, account.networkType, account.index),
                    addresses: enhanceAddresses(accountInfo, account),
                    tokens: enhanceTokens(accountInfo.tokens),
                    ...getAccountSpecific(accountInfo, account.networkType),
                },
            };
        }
        return {
            payload: account,
        };
    },
);

const renameAccount = createAction(
    `${accountActionsPrefix}/renameAccount`,
    (accountKey: string, accountLabel: string) => ({
        payload: {
            accountKey,
            accountLabel,
        },
    }),
);

const startCoinjoinAccountSync = createAction(
    `${accountActionsPrefix}/startCoinjoinAccountSync`,
    (account: Extract<Account, { backendType: 'coinjoin' }>) => ({
        payload: {
            accountKey: account.key,
        },
    }),
);

const endCoinjoinAccountSync = createAction(
    `${accountActionsPrefix}/endCoinjoinAccountSync`,
    (
        account: Extract<Account, { backendType: 'coinjoin' }>,
        status: Extract<Account, { backendType: 'coinjoin' }>['status'],
    ) => ({
        payload: {
            accountKey: account.key,
            status,
        },
    }),
);

const changeAccountVisibility = createAction(
    `${accountActionsPrefix}/changeAccountVisibility`,
    (account: Account, visible = true): { payload: Account } => ({
        payload: {
            ...account,
            visible,
        },
    }),
);

export const accountsActions = {
    disposeAccount,
    removeAccount,
    createAccount,
    updateAccount,
    renameAccount,
    updateSelectedAccount,
    changeAccountVisibility,
    startCoinjoinAccountSync,
    endCoinjoinAccountSync,
} as const;
