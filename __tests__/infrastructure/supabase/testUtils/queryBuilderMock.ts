type QueryResult<T> = {
  data: T;
  error: null;
};

export type QueryBuilderMock<T> = QueryResult<T> & {
  select: jest.Mock<QueryBuilderMock<T>, [string?]>;
  eq: jest.Mock<QueryBuilderMock<T>, [string, unknown]>;
  is: jest.Mock<QueryBuilderMock<T>, [string, unknown]>;
  order: jest.Mock<QueryBuilderMock<T>, [string, { ascending: boolean }]>;
  limit: jest.Mock<QueryBuilderMock<T>, [number]>;
  in: jest.Mock<QueryBuilderMock<T>, [string, unknown[]]>;
  or: jest.Mock<QueryBuilderMock<T>, [string]>;
  single: jest.Mock<QueryBuilderMock<T>, []>;
  maybeSingle: jest.Mock<QueryBuilderMock<T>, []>;
};

export const createQueryBuilderMock = <T>(data: T): QueryBuilderMock<T> => {
  const builder = {
    data,
    error: null,
    select: jest.fn(),
    eq: jest.fn(),
    is: jest.fn(),
    order: jest.fn(),
    limit: jest.fn(),
    in: jest.fn(),
    or: jest.fn(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  } as QueryBuilderMock<T>;

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.is.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.limit.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);
  builder.or.mockReturnValue(builder);
  builder.single.mockReturnValue(builder);
  builder.maybeSingle.mockReturnValue(builder);

  return builder;
};
