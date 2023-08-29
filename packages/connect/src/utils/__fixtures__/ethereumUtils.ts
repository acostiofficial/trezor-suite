import coinsJSON from '@trezor/connect-common/files/coins.json';
import coinsJSONEth from '@trezor/connect-common/files/coins-eth.json';
import blockchainLinkJSON from '@trezor/connect-common/files/blockchain-link.json';

import { getNetworkLabel } from '../ethereumUtils';

import { parseCoinsJson } from '../../data/coinInfo';

parseCoinsJson(
    {
        ...coinsJSON,
        eth: coinsJSONEth,
    },
    blockchainLinkJSON,
);

export const getNetworkLabelFixtures: TestFixtures<typeof getNetworkLabel> = [
    {
        description: 'eth',
        input: ['Export #NETWORK address', getEthereumNetwork('eth')],
        output: 'Export Ethereum address',
    },
];
