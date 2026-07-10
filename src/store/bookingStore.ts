import { create } from "zustand";
import type { Service } from "@/types";

interface BookingState {
  branchId: number | null;
  branchName: string | null;

  service: Service | null;

  specialistId: number | null;
  specialistName: string | null;

  date: string | null; // YYYY-MM-DD
  time: string | null; // HH:mm

  setBranch: (id: number, name: string) => void;
  setService: (service: Service) => void;
  setSpecialist: (id: number, name: string) => void;
  setDateTime: (date: string, time: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  branchId: null,
  branchName: null,
  service: null,
  specialistId: null,
  specialistName: null,
  date: null,
  time: null,

  setBranch: (id, name) =>
    set({
      branchId: id,
      branchName: name,
      service: null,
      specialistId: null,
      specialistName: null,
      date: null,
      time: null,
    }),

  setService: (service) =>
    set({
      service,
      specialistId: null,
      specialistName: null,
      date: null,
      time: null,
    }),

  setSpecialist: (id, name) =>
    set({ specialistId: id, specialistName: name, date: null, time: null }),

  setDateTime: (date, time) => set({ date, time }),

  reset: () =>
    set({
      branchId: null,
      branchName: null,
      service: null,
      specialistId: null,
      specialistName: null,
      date: null,
      time: null,
    }),
}));