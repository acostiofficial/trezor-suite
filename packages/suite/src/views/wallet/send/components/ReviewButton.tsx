import React from 'react';
import { useWatch } from 'react-hook-form';
import styled from 'styled-components';

import { Checkbox, TooltipButton, Warning, variables } from '@trezor/components';
import { useDevice } from '@suite-hooks';
import { useSendFormContext } from '@wallet-hooks';
import { Translation } from '@suite-components/Translation';
import { FormOptions } from '@wallet-types/sendForm';

const StyledWarning = styled(Warning)`
    margin-top: 8px;
    justify-content: flex-start;
`;

const ButtonReview = styled(TooltipButton)<{ isRed: boolean }>`
    background: ${({ isRed, theme }) => isRed && theme.BUTTON_RED};
    display: flex;
    flex-direction: column;
    margin: 32px auto;
    min-width: 200px;

    :disabled {
        background: ${({ theme }) => theme.STROKE_GREY};
    }

    :hover {
        background: ${({ isRed, theme }) => isRed && theme.BUTTON_RED_HOVER};
    }
`;

const TooltipHeading = styled.p`
    opacity: 0.6;
`;

const List = styled.ul`
    list-style: disc;
    margin-left: 16px;
`;

const TextButton = styled.button`
    background: none;
    border: none;
    color: ${({ theme }) => theme.TYPE_WHITE};
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
`;

const SecondLine = styled.p`
    font-size: ${variables.FONT_SIZE.TINY};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

export const ReviewButton = () => {
    const { device, isLocked } = useDevice();
    const {
        anonymityWarningChecked,
        control,
        online,
        isLoading,
        signTransaction,
        getValues,
        getDefaultValue,
        toggleAnonymityWarning,
        toggleOption,
        composedLevels,
        isCoinControlEnabled,
        outputsWithWarning,
        isLowAnonymityUtxoSelected,
    } = useSendFormContext();

    const options = useWatch<FormOptions[]>({
        name: 'options',
        defaultValue: getDefaultValue('options', []),
        control,
    });

    const values = getValues();
    const broadcastEnabled = options.includes('broadcast');
    const coinControlOpen = options.includes('utxoSelection');
    const composedTx = composedLevels ? composedLevels[values.selectedFee || 'normal'] : undefined;
    const isOutputWarning = !!outputsWithWarning.length;
    const confirmationRequired = isLowAnonymityUtxoSelected && !anonymityWarningChecked;
    const possibleToSubmit =
        composedTx?.type === 'final' &&
        !isLocked() &&
        device?.available &&
        online &&
        !isOutputWarning;
    const isDisabled = !possibleToSubmit || confirmationRequired;
    const primaryText = broadcastEnabled ? 'REVIEW_AND_SEND_TRANSACTION' : 'SIGN_TRANSACTION';
    const secondaryText = isCoinControlEnabled
        ? 'TR_YOU_SHOULD_ANONYMIZE'
        : 'TR_NOT_ENOUGH_ANONYMIZED_FUNDS';

    const toggleUtxoSelection = () => toggleOption('utxoSelection');

    const tooltipContent =
        isOutputWarning || confirmationRequired ? (
            <>
                <TooltipHeading>
                    <Translation id="TR_NOT_ENOUGH_ANONYMIZED_FUNDS_TOOLTIP" />
                </TooltipHeading>
                <List>
                    <li>
                        <Translation id="TR_ANONYMIZATION_OPTION_1" />
                    </li>
                    <li>
                        <Translation
                            id="TR_ANONYMIZATION_OPTION_2"
                            values={{
                                button: chunks =>
                                    coinControlOpen ? (
                                        chunks
                                    ) : (
                                        <TextButton onClick={toggleUtxoSelection}>
                                            {chunks}
                                        </TextButton>
                                    ),
                            }}
                        />
                    </li>
                    <li>
                        <Translation id="TR_ANONYMIZATION_OPTION_3" />
                    </li>
                </List>
            </>
        ) : null;

    return (
        <>
            {possibleToSubmit && isLowAnonymityUtxoSelected && (
                <StyledWarning critical>
                    <Checkbox
                        isRed
                        isChecked={anonymityWarningChecked}
                        onClick={toggleAnonymityWarning}
                    >
                        <Translation id="TR_BREAKING_ANONYMITY_CHECKBOX" />
                    </Checkbox>
                </StyledWarning>
            )}
            <ButtonReview
                interactiveTooltip={!coinControlOpen}
                isRed={anonymityWarningChecked}
                tooltipContent={tooltipContent}
                data-test="@send/review-button"
                isDisabled={isDisabled || isLoading}
                onClick={signTransaction}
            >
                <Translation id={primaryText} />
                {isOutputWarning ||
                    (isLowAnonymityUtxoSelected && (
                        <SecondLine>
                            <Translation id={secondaryText} />
                        </SecondLine>
                    ))}
            </ButtonReview>
        </>
    );
};
