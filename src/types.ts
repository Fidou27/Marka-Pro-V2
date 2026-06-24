/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export type ProjectStatus = 'new' | 'progress' | 'waiting' | 'done' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  type: string;
  start: string;
  price: number;
  status: ProjectStatus;
  deadline?: string; // Target delivery date
}

export type PriceUnit = 'cm2' | 'm2' | 'fixed';
export type LengthUnit = 'mm' | 'cm' | 'm' | 'px';

export interface DesignItem {
  id: string;
  desc: string;
  length: string | number;
  width: string | number;
  unitL: LengthUnit;
  unitW: LengthUnit;
  basePrice: string | number;
  price: string | number; // unit price (e.g., rate per m2 or fixed price)
  priceUnit: PriceUnit;
  copies: number;
  individualDiscount: number;
}

export interface CalcState {
  client: string;
  offer: string;
  deadline: string;
  notes: string;
  discount: number;
  tax: number;
  margin: number;
  designs: DesignItem[];
  draft: boolean;
}
