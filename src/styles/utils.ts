import { CSSObject } from '@emotion/react';
import { CSSProperties } from '@emotion/serialize/types';
import { Property } from 'csstype';

import { standardShadows, standardSizes, transitionTimes } from '.';

export const createStandardSizing =
  (cssProp: keyof CSSProperties) =>
  (size: keyof typeof standardSizes): CSSObject => ({
    [cssProp]: standardSizes[size],
  });

export const absolute = (
  top?: number,
  right?: number,
  bottom?: number,
  left?: number,
): CSSObject => ({
  position: 'absolute',
  top,
  right,
  bottom,
  left,
});

export const relative = (
  top?: number,
  right?: number,
  bottom?: number,
  left?: number,
): CSSObject => ({
  position: 'relative',
  top,
  right,
  bottom,
  left,
});

export const borderRadius = createStandardSizing('borderRadius');

export const padding = createStandardSizing('padding');

export const margin = createStandardSizing('margin');

export const flex = (direction: Property.FlexDirection = 'row'): CSSObject => ({
  display: 'flex',
  flexDirection: direction,
});

export const flexValue = (value = 1): CSSObject => ({
  flex: value,
});

export const flexCenter: CSSObject = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const flexCenterVertical: CSSObject = {
  display: 'flex',
  alignItems: 'center',
};

export const flexCenterHorizontal: CSSObject = {
  display: 'flex',
  justifyContent: 'center',
};

export const flexBetween: CSSObject = {
  display: 'flex',
  justifyContent: 'space-between',
};

export const flexColumn = flex('column');

export const fullSize: CSSObject = {
  width: '100%',
  height: '100%',
};

export const imageCover: CSSObject = {
  objectFit: 'cover',
  ...fullSize,
};

export const imageContain: CSSObject = {
  objectFit: 'contain',
  ...fullSize,
};

export const dropShadow = (size: keyof typeof standardShadows): CSSObject => ({
  boxShadow: standardShadows[size],
});

export const textShadow = (size: keyof typeof standardShadows): CSSObject => ({
  textShadow: standardShadows[size],
});

export const center: CSSObject = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};

export const centerHorizontal: CSSObject = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
};

export const centerVertical: CSSObject = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
};

export const transition = (time: keyof typeof transitionTimes): CSSObject => ({
  transition: `all ${transitionTimes[time]}`,
});

export const clearTextStyle: CSSObject = {
  textDecoration: 'none',
  color: 'inherit',
};

export const property =
  <T extends keyof CSSProperties>(prop: T) =>
  (value: CSSProperties[T]): CSSObject => ({
    [prop]: value,
  });
