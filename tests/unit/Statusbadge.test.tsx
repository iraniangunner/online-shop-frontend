import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/app/_components/dashboard/StatusBadge";

describe("StatusBadge", () => {
  it("renders correct Persian label for confirmed status", () => {
    render(<StatusBadge status="confirmed" />);
    expect(screen.getByText("تأیید شده")).toBeInTheDocument();
  });

  it("renders correct Persian label for pending_payment status", () => {
    render(<StatusBadge status="pending_payment" />);
    expect(screen.getByText("در انتظار پرداخت")).toBeInTheDocument();
  });

  it("renders correct Persian label for completed status", () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText("انجام شده")).toBeInTheDocument();
  });

  it("renders correct Persian label for cancelled status", () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText("لغو شده")).toBeInTheDocument();
  });

  it("renders correct Persian label for no_show status", () => {
    render(<StatusBadge status="no_show" />);
    expect(screen.getByText("عدم حضور")).toBeInTheDocument();
  });

  it("falls back gracefully for an unknown status instead of crashing", () => {
    render(<StatusBadge status="some_unknown_status" />);
    expect(screen.getByText("some_unknown_status")).toBeInTheDocument();
  });
});
