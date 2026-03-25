import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";
import { mapTicketListQueryKey } from "@/modules/board/presentation/hooks/queryKeys.mapper";

describe("queryKeys ticket list mapper", () => {
  it("maps ticket list query keys to named fields", () => {
    const queryKey = queryKeys.projects.ticketsList(
      "project-1",
      {
        status: "todo",
        epicId: "epic-1",
        parentId: "parent-1",
        priority: "high",
        labelIds: ["label-2", "label-1"],
      },
      {
        field: "createdAt",
        direction: "desc",
      },
      "  search me  ",
      25
    );

    expect(mapTicketListQueryKey(queryKey)).toEqual({
      projectId: "project-1",
      filters: {
        status: "todo",
        epicId: "epic-1",
        parentId: "parent-1",
        priority: "high",
        labelIds: ["label-1", "label-2"],
      },
      sort: {
        field: "createdAt",
        direction: "desc",
      },
      search: "search me",
      limit: 25,
    });
  });

  it("returns null for non ticket-list query keys", () => {
    expect(mapTicketListQueryKey(queryKeys.projects.detail("project-1"))).toBeNull();
  });
});
