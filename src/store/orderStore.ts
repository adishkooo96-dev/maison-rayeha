import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Order } from '../types';

interface OrderState {
  lastOrder: Order | null;
  setLastOrder: (order: Order) => void;
  clearLastOrder: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      lastOrder: null,
      setLastOrder: (order: Order) => set({ lastOrder: order }),
      clearLastOrder: () => set({ lastOrder: null }),
    }),
    {
      name: 'maison_rayeha_last_order_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
