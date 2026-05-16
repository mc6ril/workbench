import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";
import {
  createTicketListFilterKey,
  mapTicketListQueryKey,
} from "@/modules/board/presentation/hooks/queryKeys.mapper";

describe("queryKeys ticket list mapper", () => {
  it("maps ticket list query keys to named fields", () => {
    const queryKey = queryKeys.projects.ticketsList(
      "project-1",
      {
        columnId: "column-todo",
        priority: "urgent",
      },
      "  search me  ",
      25
    );

    expect(mapTicketListQueryKey(queryKey)).toEqual({
      projectId: "project-1",
      filters: {
        assigneeUserIds: null,
        columnId: "column-todo",
        priority: "urgent",
        unassignedOnly: false,
      },
      search: "search me",
      limit: 25,
    });
  });

  it("returns null for non ticket-list query keys", () => {
    expect(
      mapTicketListQueryKey(queryKeys.projects.detail("project-1"))
    ).toBeNull();
  });

  it("returns null for malformed ticket list query keys", () => {
    expect(
      mapTicketListQueryKey([
        "projects",
        "project-1",
        "tickets",
        "list",
        ["column-todo", "urgent"],
      ])
    ).toBeNull();
  });

  it("normalizes empty filters to null", () => {
    expect(createTicketListFilterKey({})).toBeNull();
    expect(queryKeys.projects.ticketsList("project-1", {})).toEqual(
      queryKeys.projects.ticketsList("project-1", undefined)
    );
  });
});
