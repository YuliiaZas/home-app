import jwt from 'jsonwebtoken';
import { IJwtPayload } from '@utils';
import { ICard, ITab } from '@models';

export function isPayload(obj: jwt.JwtPayload | string): obj is IJwtPayload {
  return typeof obj === 'object' && obj !== null && typeof obj.sub === 'string' && typeof obj.v === 'number';
}

export function isTab(obj: unknown): obj is ITab {
  return (
    isObject(obj) &&
    'title' in obj &&
    'cards' in obj &&
    Array.isArray(obj.cards) &&
    obj.cards.every((card: unknown) => isCard(card))
  );
}

export function isCard(obj: unknown): obj is ICard {
  return (
    isObject(obj) &&
    'title' in obj &&
    'layout' in obj &&
    isCardLayout(obj.layout) &&
    'items' in obj &&
    isCardItems(obj.items)
  );
}

export function isCardLayout(layout: unknown): layout is ICard['layout'] {
  return typeof layout === 'string' && ['verticalLayout', 'horizontalLayout', 'singleDevice'].includes(layout);
}

export function isCardItems(items: unknown): items is ICard['items'] {
  return Array.isArray(items) && items.every((item: unknown) => typeof item === 'string');
}

export function isObject(obj: unknown): obj is Record<string, unknown> {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}
