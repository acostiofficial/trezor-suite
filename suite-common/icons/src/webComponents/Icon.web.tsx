import React from 'react';
import { ReactSVG } from 'react-svg';

import styled, { useTheme } from 'styled-components';

import { Color } from '@trezor/theme';

import { IconName, icons } from '../icons';

const SVG = styled(ReactSVG)`
    display: flex;
    align-items: center;
    justify-content: center;

    div {
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

type IconProps = {
    name: IconName;
    size?: IconSize;
    customSize?: number;
    color?: Color;
    className?: string;
};

const iconSizes = {
    extraSmall: 8,
    small: 12,
    medium: 16,
    mediumLarge: 20,
    large: 24,
    extraLarge: 32,
} as const;

type IconSize = keyof typeof iconSizes;

export const Icon = ({
    name,
    customSize,
    size = 'large',
    color = 'iconDefault',
    className,
}: IconProps) => {
    const theme = useTheme();

    const iconSize = customSize || iconSizes[size];

    return (
        <SVG
            src={icons[name]}
            beforeInjection={svg => {
                svg.querySelectorAll('path')?.forEach(path =>
                    path.setAttribute('stroke', theme[color]),
                );
                svg.setAttribute('width', `${iconSize}px`);
                svg.setAttribute('height', `${iconSize}px`);
            }}
            className={className}
        />
    );
};
