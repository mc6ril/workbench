import { fireEvent, render, screen } from "@testing-library/react";

import TicketCard from "@/modules/board/presentation/components/ticket/ticketCard/TicketCard";

const getRenderedCard = (): HTMLElement => {
  const card = screen.getByText("Ticket title").closest("article");

  if (!card) {
    throw new Error("Expected ticket card article to be rendered");
  }

  return card;
};

describe("TicketCard prefetch", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("prefetches ticket detail after a short hover delay", () => {
    const onPrefetch = jest.fn();

    render(
      <TicketCard id="ticket-1" title="Ticket title" onPrefetch={onPrefetch} />
    );

    fireEvent.mouseEnter(getRenderedCard());

    jest.advanceTimersByTime(119);
    expect(onPrefetch).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onPrefetch).toHaveBeenCalledTimes(1);
    expect(onPrefetch).toHaveBeenCalledWith("ticket-1");
  });

  it("prefetches immediately on pointer down and clears any pending hover timer", () => {
    const onPrefetch = jest.fn();

    render(
      <TicketCard id="ticket-1" title="Ticket title" onPrefetch={onPrefetch} />
    );

    const card = getRenderedCard();

    fireEvent.mouseEnter(card);
    fireEvent.pointerDown(card, { button: 0 });

    expect(onPrefetch).toHaveBeenCalledTimes(1);
    expect(onPrefetch).toHaveBeenCalledWith("ticket-1");

    jest.runAllTimers();
    expect(onPrefetch).toHaveBeenCalledTimes(1);
  });
});
