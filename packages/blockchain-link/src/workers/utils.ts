import BigNumber from 'bignumber.js';
import type { Address } from '../types';
import type { VinVout } from '../types/blockbook';

export type Addresses = (Address | string)[] | string;

export const filterTargets = (addresses: Addresses, targets: VinVout[]): VinVout[] => {
    if (typeof addresses === 'string') {
        addresses = [addresses];
    }
    // neither addresses or targets are missing
    if (!addresses || !Array.isArray(addresses) || !targets || !Array.isArray(targets)) return [];

    const all: (string | null)[] = addresses.map(a => {
        if (typeof a === 'string') return a;
        if (typeof a === 'object' && typeof a.address === 'string') return a.address;
        return null;
    });

    return targets.filter(t => {
        if (t && Array.isArray(t.addresses)) {
            return t.addresses.filter(a => all.indexOf(a) >= 0).length > 0;
        }
        return false;
    });
};

export const sumVinVout = (
    vinVout: VinVout[],
    initialValue = '0',
    operation: 'sum' | 'reduce' = 'sum',
) => {
    const sum = vinVout.reduce((bn, v) => {
        if (typeof v.value !== 'string') return bn;
        return operation === 'sum' ? bn.plus(v.value) : bn.minus(v.value);
    }, new BigNumber(initialValue));
    return sum.toString();
};

export const transformTarget = (target: VinVout, incoming: VinVout[]) => ({
    n: target.n || 0,
    addresses: target.addresses,
    isAddress: target.isAddress,
    amount: target.value,
    coinbase: target.coinbase,
    isAccountTarget: incoming.includes(target) ? true : undefined,
});

const IS_ONION = /\.onion([/:].*)?$/i;
const IS_LOCALHOST = /^(\w*:\/\/)?(localhost|127\.0\.0\.1)([/:].*)?$/i;

/**
 * Sorts array of backend urls so the localhost addresses are first,
 * then onion addresses and then the rest. Apart from that it will
 * be shuffled randomly.
 */
export const prioritizeEndpoints = (urls: string[]) =>
    urls
        .map((url): [string, number] => {
            let prio = Math.random();
            if (IS_LOCALHOST.test(url)) {
                prio += 2;
            } else if (IS_ONION.test(url)) {
                prio += 1;
            }
            return [url, prio];
        })
        .sort(([, a], [, b]) => b - a)
        .map(([url]) => url);
