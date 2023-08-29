import { TranslationKey } from '@suite-common/intl-types';
import { roundPhases, sessionPhases } from '@trezor/coinjoin';
import { RoundPhase, SessionPhase } from 'src/types/wallet/coinjoin';

export const ROUND_PHASE_MESSAGES: Record<RoundPhase, TranslationKey> = {
    [roundPhases.InputRegistration]: 'TR_COINJOIN_PHASE_0_MESSAGE',
    [roundPhases.ConnectionConfirmation]: 'TR_COINJOIN_PHASE_1_MESSAGE',
    [roundPhases.OutputRegistration]: 'TR_COINJOIN_PHASE_2_MESSAGE',
    [roundPhases.TransactionSigning]: 'TR_COINJOIN_PHASE_3_MESSAGE',
    [roundPhases.Ended]: 'TR_COINJOIN_PHASE_4_MESSAGE',
};

export const SESSION_PHASE_MESSAGES: Record<SessionPhase, TranslationKey> = {
    [sessionPhases.RoundSearch]: 'TR_SESSION_PHASE_ROUND_SEARCH',
    [sessionPhases.CoinSelection]: 'TR_SESSION_PHASE_COIN_SELECTION',
    [sessionPhases.RoundPairing]: 'TR_SESSION_PHASE_ROUND_PAIRING',
    [sessionPhases.CoinRegistration]: 'TR_SESSION_PHASE_COIN_REGISTRATION',
    [sessionPhases.AccountMissingUtxos]: 'TR_SESSION_ERROR_PHASE_MISSING_UTXOS',
    [sessionPhases.SkippingRound]: 'TR_SESSION_ERROR_PHASE_SKIPPING_ROUND',
    [sessionPhases.RetryingRoundPairing]: 'TR_SESSION_ERROR_PHASE_RETRYING_PAIRING',
    [sessionPhases.AffiliateServerOffline]: 'TR_SESSION_ERROR_PHASE_AFFILIATE_SERVERS_OFFLINE',
    [sessionPhases.CriticalError]: 'TR_SESSION_ERROR_PHASE_CRITICAL_ERROR',
    [sessionPhases.BlockedUtxos]: 'TR_SESSION_ERROR_PHASE_BLOCKED_UTXOS',
    [sessionPhases.AwaitingConfirmation]: 'TR_SESSION_PHASE_AWAITING_CONFIRMATION',
    [sessionPhases.AwaitingOthersConfirmation]: 'TR_SESSION_PHASE_WAITING_FOR_OTHERS',
    [sessionPhases.RegisteringOutputs]: 'TR_SESSION_PHASE_REGISTERING_OUTPUTS',
    [sessionPhases.AwaitingOthersOutputs]: 'TR_SESSION_PHASE_WAITING_FOR_COORDINATOR',
    [sessionPhases.OutputRegistrationFailed]: 'TR_SESSION_ERROR_PHASE_REGISTRATION_FAILED',
    [sessionPhases.AwaitingCoinjoinTransaction]: 'TR_SESSION_PHASE_AWAITING_TRANSACTION',
    [sessionPhases.TransactionSigning]: 'TR_SESSION_PHASE_TRANSACTION_SIGNING',
    [sessionPhases.SendingSignature]: 'TR_SESSION_PHASE_SENDING_SIGNATURE',
    [sessionPhases.AwaitingOtherSignatures]: 'TR_SESSION_PHASE_AWAITING_SIGNATURES',
    [sessionPhases.SignatureFailed]: 'TR_SESSION_PHASE_SIGNING_FAILED',
};

export const SESSION_PHASE_TRANSITION_DELAY = 3000;

/**
 * Values are upper limits of anonymity level for each status.
 */
export enum AnonymityStatus {
    Bad = 5,
    Medium = 10,
    Good = 20,
    Great = 100,
}
