import api from "./api";

export const getGameData = async (gameId: string | number) => {
  const response = await api.get(`/games/${gameId}`);
  return response.data.data;
};

export const getUserData =  async (userId: number) => {
  const response = await api.get(`/users/${userId}`);
  return response.data.data;
};

export const getBGImage = async (imgName: string) => {
  try {

    const response = await api.get(`/images/image/${imgName}.png`, {
      responseType: "blob",
    });

    const imageUrl = URL.createObjectURL(response.data);
    return imageUrl;
  } catch (error) {
    console.error("Failed to fetch image:", error);
    throw error;
  }
};

export const useHint = async (userId: string | number) => {
  const response = await api.post(`/users/${userId}/usehint`);
  return response.data.hint;
};
