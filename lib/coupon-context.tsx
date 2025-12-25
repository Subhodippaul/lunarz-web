"use client";
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Coupon, DiscountCalculation } from './coupon-services';

interface CouponState {
  appliedCoupon: Coupon | null;
  discountCalculation: DiscountCalculation | null;
  isValidating: boolean;
  error: string | null;
}

type CouponAction =
  | { type: 'SET_VALIDATING'; payload: boolean }
  | { type: 'SET_COUPON'; payload: { coupon: Coupon; calculation: DiscountCalculation } }
  | { type: 'CLEAR_COUPON' }
  | { type: 'SET_ERROR'; payload: string };

const initialState: CouponState = {
  appliedCoupon: null,
  discountCalculation: null,
  isValidating: false,
  error: null,
};

const couponReducer = (state: CouponState, action: CouponAction): CouponState => {
  switch (action.type) {
    case 'SET_VALIDATING':
      return {
        ...state,
        isValidating: action.payload,
        error: null,
      };
    case 'SET_COUPON':
      return {
        ...state,
        appliedCoupon: action.payload.coupon,
        discountCalculation: action.payload.calculation,
        isValidating: false,
        error: null,
      };
    case 'CLEAR_COUPON':
      return {
        ...state,
        appliedCoupon: null,
        discountCalculation: null,
        isValidating: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        appliedCoupon: null,
        discountCalculation: null,
        isValidating: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

interface CouponContextType {
  state: CouponState;
  dispatch: React.Dispatch<CouponAction>;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(couponReducer, initialState);

  return (
    <CouponContext.Provider value={{ state, dispatch }}>
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupon = (): CouponContextType => {
  const context = useContext(CouponContext);
  if (context === undefined) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};