import api from "./api";

export const getGameData = async (gameId: string | number) => {
  const response = await api.get(`/games/${gameId}`);
  return response.data.data;
};

export const getBGImage = async (gameId: string, gameTopic: string) => {
  try {
    const topic = gameTopic;
    const sanitizedTopic = topic.replace(/\s+/g, "_");
    const imgName = `image_${gameId}_${sanitizedTopic}`;

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
