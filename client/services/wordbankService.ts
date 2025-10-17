import { getLoggedInUserId, getToken } from "@/utils/auth";
import api from "./api";
import axios, { AxiosResponse } from "axios";

export type SideItem = { n: number; word: string };
export type ApiOK = {
  page: number;
  perSide: number;
  spreadSize?: number;
  total: number;
  totalPages: number;
  left: SideItem[];
  right: SideItem[];
  words?: BankSection;
  extra?: BankSection;
  wordsSince?: string | null;
  extraSince?: string | null;
};
type ApiErr = { error?: string; message?: string };

type BankSection = {
  total: number;
  totalPages: number;
  left: SideItem[];
  right: SideItem[];
};
type BackendRes = {
  page: number;
  perSide: number;
  spreadSize: number;
  words: BankSection;
  extra: BankSection;
  wordsSince?: string | null;
  extraSince?: string | null;
};

export async function fetchWordBankPage(
  page: number,
  source: "words" | "extra" = "words"
): Promise<ApiOK> {
  const token = await getToken();
  const userId = await getLoggedInUserId();
  if (!token || !userId) throw new Error("Not logged in");

  try {
    const res: AxiosResponse<BackendRes> = await api.get(
      `/wordbank/user/${userId}/wordbank`,
      {
        params: { page: Math.max(1, page) },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const section = source === "extra" ? res.data.extra : res.data.words;

    return {
      page: res.data.page,
      total: section.total,
      totalPages: section.totalPages,
      perSide: res.data.perSide,
      left: section.left,
      right: section.right,
      wordsSince: res.data.wordsSince ?? null,
      extraSince: res.data.extraSince ?? null,
    };
  } catch (err: any) {
    if (axios.isAxiosError<ApiErr>(err)) {
      const status = err.response?.status;
      const apiMsg = err.response?.data?.error || err.response?.data?.message;
      throw new Error(apiMsg || (status ? `HTTP ${status}` : err.message));
    }
    throw err;
  }
}
