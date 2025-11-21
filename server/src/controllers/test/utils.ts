import { Request } from "express";

export const mockReq = (
  data: Partial<Request> & { user?: { id: number } } = {}
) => {
  return {
    body: {},
    params: {},
    query: {},
    ...data,
  } as Request & { user?: { id: number } };
};

export const mockRes = () => {
  const res: any = {};
  res.status = jest.fn((_code?: number) => res);
  res.json = jest.fn((_body?: any) => res);
  res.send = jest.fn((_body?: any) => res);
  res.end = jest.fn(() => res);
  // Header helpers used by getImage controller
  res.setHeader = jest.fn((_key?: string, _val?: any) => res);
  res.header = jest.fn((_key?: string, _val?: any) => res);
  res.set = jest.fn((_key?: string, _val?: any) => res);
  res.type = jest.fn((_val?: string) => res);
  return res;
};

export const resetAll = () => {
  jest.clearAllMocks();
};