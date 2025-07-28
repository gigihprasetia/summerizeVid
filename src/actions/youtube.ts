"use server";
import axios, { AxiosError } from "axios";

const apiKey = process.env.GEMINI_API_KEY;

export const getChannelInfo = async (channelId: string): Promise<any> => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;

    const response = await axios.get(url);

    if (response.data.items.length === 0) {
      throw new Error("tidak ditemukan channel");
    }

    const channelData = response.data.items[0];

    const info = {
      id: channelData.id,
      title: channelData.snippet.title,
      description: channelData.snippet.description,
      publishedAt: channelData.snippet.publishedAt,
      thumbnails: channelData.snippet.thumbnails,
      subscriberCount: channelData.statistics.subscriberCount,
      videoCount: channelData.statistics.videoCount,
      viewCount: channelData.statistics.viewCount,
    };

    return info;
  } catch (err) {
    console.log(err);
    throw new Error("getChannel info");
  }
};

export const getChannelVideos = async (
  channelId: string,
  maxResults = 10,
  pageToken = "",
  q = ""
): Promise<any[]> => {
  try {
    const response = await axios({
      url: "https://www.googleapis.com/youtube/v3/search",
      method: "GET",
      params: {
        key: apiKey,
        channelId: channelId,
        part: "snippet,id",
        order: "date",
        maxResults: maxResults,
        type: "video",
        pageToken: pageToken,
        q,
      },
    });

    return response.data;
  } catch (err) {
    console.error("❌ Gagal getChannelVideos:", err);
    throw new Error("Gagal mengambil video channel");
  }
};

export const getChannel = async ({
  source,
}: {
  source: string;
}): Promise<any> => {
  console.log("test");
  try {
    const handleMatch = source.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
    const userMatch = source.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/);
    const channelMatch = source.match(
      /youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/
    );

    if (channelMatch) {
      return channelMatch[1];
    }

    if (handleMatch) {
      const handle = handleMatch[1];
      const searchRes = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: `@${handle}`,
            type: "channel",
            key: apiKey,
          },
        }
      );

      const channelId = searchRes.data.items[0]?.id?.channelId;

      const info = await getChannelInfo(channelId);
      const videos = await getChannelVideos(channelId);

      return { info, videos };
    } else {
      throw new Error("channel not found");
    }
  } catch (err: any) {
    const e = err?.response?.data?.error?.message;
    throw new Error(e);
  }
};
