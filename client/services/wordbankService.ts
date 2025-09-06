import { getLoggedInUserId, getToken } from "@/utils/auth";
import api from "./api";
import axios, { AxiosResponse } from "axios";

export type SideItem = { n: number; word: string };
export type ApiOK = {
  page: number;
  total: number;
  totalPages: number;
  perSide: number;
  left: SideItem[];
  right: SideItem[];
};
type ApiErr = { error?: string; message?: string };

export async function fetchWordBankPage(page: number, apiBase?: string): Promise<ApiOK> {
  const token = await getToken();
  const userId = await getLoggedInUserId();
  if (!token || !userId) throw new Error("Not logged in");


  try {
    // 👇 Tell axios what type to expect in data
    const res: AxiosResponse<ApiOK> = await api.get(`/wordbank/user/${userId}/wordbank`, {
      params: { page: Math.max(1, page) },
      headers: { Authorization:`Bearer ${token}` },
    });

    return res.data; // res.data is strongly typed as ApiOK
  } catch (err: any) {
    if (axios.isAxiosError<ApiErr>(err)) {
      const status = err.response?.status;
      const apiMsg = err.response?.data?.error || err.response?.data?.message;
      throw new Error(apiMsg || (status ? `HTTP ${status}` : err.message));
    }
    throw err;
  }
}