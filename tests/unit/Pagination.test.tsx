import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "@/app/_components/ui/Pagination";

describe("Pagination", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        lastPage={1}
        total={5}
        onPageChange={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the total count", () => {
    render(
      <Pagination
        currentPage={1}
        lastPage={3}
        total={42}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it("calls onPageChange with the clicked page number", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Pagination
        currentPage={1}
        lastPage={3}
        total={30}
        onPageChange={onPageChange}
      />
    );

    await user.click(screen.getByText("2"));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables the previous button on the first page", () => {
    render(
      <Pagination
        currentPage={1}
        lastPage={3}
        total={30}
        onPageChange={vi.fn()}
      />
    );

    // دکمه‌ی «›» (رفتن به صفحه‌ی قبل، یعنی currentPage - 1) باید غیرفعال باشه
    const buttons = screen.getAllByRole("button");
    const prevButton = buttons.find((b) => b.textContent === "›");

    expect(prevButton).toBeDisabled();
  });

  it("disables the next button on the last page", () => {
    render(
      <Pagination
        currentPage={3}
        lastPage={3}
        total={30}
        onPageChange={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole("button");
    const nextButton = buttons.find((b) => b.textContent === "‹");

    expect(nextButton).toBeDisabled();
  });

  it("highlights the current page", () => {
    render(
      <Pagination
        currentPage={2}
        lastPage={3}
        total={30}
        onPageChange={vi.fn()}
      />
    );

    const currentPageButton = screen.getByText("2");
    expect(currentPageButton.className).toContain("A72F3B");
  });
});
