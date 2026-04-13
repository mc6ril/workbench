import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import BoardColumn from "@/modules/board/presentation/components/board/boardColumn/BoardColumn";

const mockSortableMouseDown = jest.fn();
const mockSortableTouchStart = jest.fn();
const mockSortableKeyDown = jest.fn();

jest.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
}));

jest.mock("@dnd-kit/sortable", () => ({
  defaultAnimateLayoutChanges: jest.fn(),
  SortableContext: ({ children }: { children: ReactNode }) => children,
  useSortable: () => ({
    attributes: {
      role: "button",
      tabIndex: 0,
    },
    listeners: {
      onKeyDown: mockSortableKeyDown,
      onMouseDown: mockSortableMouseDown,
      onTouchStart: mockSortableTouchStart,
    },
    setNodeRef: jest.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  verticalListSortingStrategy: jest.fn(),
}));

const ticket = {
  id: "ticket-1",
  title: "Ticket title",
  ticketCode: "WB-12",
};

const renderBoardColumn = ({
  isSortable = true,
  onTicketClick = jest.fn(),
  onTicketPrefetch = jest.fn(),
}: {
  isSortable?: boolean;
  onTicketClick?: jest.Mock;
  onTicketPrefetch?: jest.Mock;
} = {}) => {
  render(
    <BoardColumn
      id="column-1"
      title="Todo"
      tickets={[ticket]}
      isSortable={isSortable}
      onTicketClick={onTicketClick}
      onTicketPrefetch={onTicketPrefetch}
    />
  );

  return {
    onTicketClick,
    onTicketPrefetch,
  };
};

const getInteractiveCard = (): HTMLElement => {
  return screen.getByRole("button");
};

describe("BoardColumn ticket interactions", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("prefetches ticket detail after a short hover delay", () => {
    const { onTicketPrefetch } = renderBoardColumn();

    fireEvent.mouseEnter(getInteractiveCard());

    jest.advanceTimersByTime(119);
    expect(onTicketPrefetch).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onTicketPrefetch).toHaveBeenCalledTimes(1);
    expect(onTicketPrefetch).toHaveBeenCalledWith("ticket-1");
  });

  it("prefetches immediately on pointer down", () => {
    const { onTicketPrefetch } = renderBoardColumn();

    fireEvent.mouseDown(getInteractiveCard(), {
      button: 0,
      clientX: 0,
      clientY: 0,
    });

    expect(onTicketPrefetch).toHaveBeenCalledTimes(1);
    expect(onTicketPrefetch).toHaveBeenCalledWith("ticket-1");
    expect(mockSortableMouseDown).toHaveBeenCalledTimes(1);
  });

  it("opens the ticket when the card is clicked", () => {
    const { onTicketClick } = renderBoardColumn();

    fireEvent.click(screen.getByText("Ticket title"));

    expect(onTicketClick).toHaveBeenCalledTimes(1);
    expect(onTicketClick).toHaveBeenCalledWith("ticket-1");
  });

  it("does not open the ticket after a mouse drag gesture", () => {
    const { onTicketClick } = renderBoardColumn();
    const card = getInteractiveCard();

    fireEvent.mouseDown(card, {
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    fireEvent.mouseMove(card, {
      clientX: 5,
      clientY: 0,
    });
    fireEvent.mouseUp(card, {
      clientX: 5,
      clientY: 0,
    });
    fireEvent.click(card);

    expect(onTicketClick).not.toHaveBeenCalled();
  });

  it("does not open the ticket after a long touch press", () => {
    const { onTicketClick } = renderBoardColumn();
    const card = getInteractiveCard();

    fireEvent.touchStart(card, {
      touches: [
        {
          clientX: 0,
          clientY: 0,
        },
      ],
    });
    jest.advanceTimersByTime(150);
    fireEvent.touchEnd(card, {
      changedTouches: [
        {
          clientX: 0,
          clientY: 0,
        },
      ],
    });
    fireEvent.click(card);

    expect(onTicketClick).not.toHaveBeenCalled();
    expect(mockSortableTouchStart).toHaveBeenCalledTimes(1);
  });

  it("opens the ticket with the Enter key even when drag is disabled", () => {
    const { onTicketClick } = renderBoardColumn({
      isSortable: false,
    });

    fireEvent.keyDown(getInteractiveCard(), {
      key: "Enter",
    });

    expect(onTicketClick).toHaveBeenCalledTimes(1);
    expect(onTicketClick).toHaveBeenCalledWith("ticket-1");
  });
});
