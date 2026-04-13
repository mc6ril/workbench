import { render, screen } from "@testing-library/react";

import TicketCard from "@/modules/board/presentation/components/ticket/ticketCard/TicketCard";

describe("TicketCard", () => {
  it("renders the ticket content without an inline open button", () => {
    render(
      <TicketCard
        id="ticket-1"
        title="Ticket title"
        ticketCode="WB-12"
        assigneeName="Alex"
      />
    );

    expect(screen.getByText("Ticket title")).toBeInTheDocument();
    expect(screen.getByText("WB-12")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
