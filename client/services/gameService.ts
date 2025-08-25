import api from "./api";

export const getGameData = async (gameId: string | number) => {
  const response = await api.get(`/games/${gameId}`);
  return response.data.data;
};

export const useHint = async (userId: string | number) => {
  const response = await api.post(`/users/${userId}/usehint`);
  return response.data.hint;
};
