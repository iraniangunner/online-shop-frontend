import { describe, it, expect, beforeEach } from "vitest";
import { useBookingStore } from "@/store/bookingStore";

const sampleService = {
  id: 1,
  service_category_id: 1,
  name: "پاکسازی پوست",
  slug: "skin-cleaning",
  description: null,
  image: null,
  duration_minutes: 30,
  price: 500000,
  is_active: true,
};

describe("bookingStore", () => {
  beforeEach(() => {
    // قبل از هر تست، store رو به حالت اولیه برمی‌گردونیم
    useBookingStore.getState().reset();
  });

  it("starts with all fields empty", () => {
    const state = useBookingStore.getState();

    expect(state.branchId).toBeNull();
    expect(state.service).toBeNull();
    expect(state.specialistId).toBeNull();
    expect(state.date).toBeNull();
    expect(state.time).toBeNull();
  });

  it("setBranch sets branch and resets everything after it", () => {
    const { setBranch, setService, setSpecialist } = useBookingStore.getState();

    setService(sampleService);
    setSpecialist(5, "دکتر نمونه");

    setBranch(1, "شعبه مرکزی");

    const state = useBookingStore.getState();
    expect(state.branchId).toBe(1);
    expect(state.branchName).toBe("شعبه مرکزی");
    // انتخاب‌های بعدی باید پاک شده باشن چون شعبه عوض شد
    expect(state.service).toBeNull();
    expect(state.specialistId).toBeNull();
  });

  it("setService sets service and resets specialist/date after it", () => {
    const { setSpecialist, setDateTime, setService } =
      useBookingStore.getState();

    setSpecialist(5, "دکتر نمونه");
    setDateTime("2026-07-15", "10:00");

    setService(sampleService);

    const state = useBookingStore.getState();
    expect(state.service).toEqual(sampleService);
    expect(state.specialistId).toBeNull();
    expect(state.date).toBeNull();
    expect(state.time).toBeNull();
  });

  it("setSpecialist sets specialist and resets date/time after it", () => {
    const { setDateTime, setSpecialist } = useBookingStore.getState();

    setDateTime("2026-07-15", "10:00");
    setSpecialist(7, "دکتر دیگر");

    const state = useBookingStore.getState();
    expect(state.specialistId).toBe(7);
    expect(state.specialistName).toBe("دکتر دیگر");
    expect(state.date).toBeNull();
    expect(state.time).toBeNull();
  });

  it("setDateTime sets date and time correctly", () => {
    const { setDateTime } = useBookingStore.getState();

    setDateTime("2026-07-20", "14:30");

    const state = useBookingStore.getState();
    expect(state.date).toBe("2026-07-20");
    expect(state.time).toBe("14:30");
  });

  it("reset clears every field back to initial state", () => {
    const { setBranch, setService, setSpecialist, setDateTime, reset } =
      useBookingStore.getState();

    setBranch(1, "شعبه مرکزی");
    setService(sampleService);
    setSpecialist(5, "دکتر نمونه");
    setDateTime("2026-07-15", "10:00");

    reset();

    const state = useBookingStore.getState();
    expect(state.branchId).toBeNull();
    expect(state.service).toBeNull();
    expect(state.specialistId).toBeNull();
    expect(state.date).toBeNull();
    expect(state.time).toBeNull();
  });
});
