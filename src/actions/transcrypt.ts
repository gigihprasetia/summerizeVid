// "use server";
// import ytdl from "@distube/ytdl-core";
// import fs from "fs-extra";
// import Ffmpeg from "fluent-ffmpeg";
// import Stream from "stream";
// import path from "path";
// import { fileURLToPath } from "url";
// import { AI_AGENT } from "@/lib/utils";
// import { askToChatGPT } from "./openai";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const formattedMp3 = async (
//   audioStream: Stream.Readable,
//   path: string
// ): Promise<void> => {
//   return new Promise((res, rej) => {
//     console.log("Start To formatted Mp3");
//     Ffmpeg(audioStream)
//       .audioBitrate(128)
//       .format("mp3")
//       .save(path)
//       .on("end", () => {
//         console.log("✅ Download dan konversi selesai:", path);
//         res();
//       })
//       .on("error", (err) => {
//         console.error("❌ Error saat konversi:", err.message);
//         rej();
//       });
//   });
// };

// const getAudioStream = async (
//   urlYtb: string
// ): Promise<{ audioStream: Stream.Readable; outputPath: string }> => {
//   console.log("Start To Get Audio Stream");
//   try {
//     const audioStream = ytdl(urlYtb, {
//       quality: "highest",
//       filter: "audioonly",
//       requestOptions: {
//         headers: {
//           "User-Agent":
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
//             "AppleWebKit/537.36 (KHTML, like Gecko) " +
//             "Chrome/115.0.0.0 Safari/537.36",
//           Accept: "*/*",
//           Referer: "https://www.youtube.com/",
//         },
//       },
//     });
//     const basicInfo = await ytdl.getBasicInfo(urlYtb);
//     const titleVideo = basicInfo.videoDetails.title.replace(
//       /[^a-zA-Z0-9]/g,
//       ""
//     );

//     const outputPath = path.join(__dirname, "../assets", `${titleVideo}.mp3`);

//     console.log("Get Audio Stream Complete");
//     return { audioStream, outputPath };
//   } catch (err) {
//     if (err instanceof Error) throw new Error(err.message);

//     throw new Error("terjadi kesalahan get audio stream");
//   }
// };

// export const linkToText = async ({
//   urlYtb,
//   language,
// }: {
//   urlYtb: string;
//   language: string;
// }) => {
//   try {
//     const { audioStream, outputPath } = await getAudioStream(urlYtb);

//     await formattedMp3(audioStream, outputPath);

//     // OPENAI

//     console.log('memulai transcrypt')

//     const transcription = await AI_AGENT.audio.transcriptions.create({
//       file: fs.createReadStream(outputPath),
//       model: "gpt-4o-transcribe",
//       response_format: "text",
//     });

//     const summarize = await askToChatGPT(
//       `summerize this text: ${transcription}`
//     );

//     return {
//       raw: transcription,
//       summary: summarize,
//     };
//   } catch (err) {
//     if (err instanceof Error) throw new Error(err.message);

//     throw new Error("terjadi kesalahan link to text");
//   }
// };

"use server";
import ytdl from "@distube/ytdl-core";
import fs from "fs-extra";
import Ffmpeg from "fluent-ffmpeg";
import Stream from "stream";
import path from "path";
import { fileURLToPath } from "url";
import { AI_AGENT } from "@/lib/utils";
import { askToChatGPT } from "./openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const formattedMp3Split = async (
  audioStream: Stream.Readable,
  outputDir: string,
  segmentDurationSec = 600 // 10 menit
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    console.log("⏳ Start splitting and formatting MP3");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPattern = `${outputDir}/output_%03d.mp3`;

    Ffmpeg(audioStream)
      .audioBitrate(128)
      .format("mp3")
      .outputOptions([
        `-f segment`,
        `-segment_time ${segmentDurationSec}`,
        `-reset_timestamps 1`,
      ])
      .on("end", () => {
        console.log("✅ Split dan konversi selesai");
        const files = fs
          .readdirSync(outputDir)
          .filter((file) => file.endsWith(".mp3"))
          .map((file) => path.join(outputDir, file))
          .sort();
        resolve(files);
      })
      .on("error", (err) => {
        console.error("❌ Error saat split/konversi:", err.message);
        reject(err);
      })
      .save(outputPattern);
  });
};

const getAudioStream = async (
  urlYtb: string
): Promise<{ audioStream: Stream.Readable; titleSlug: string }> => {
  console.log("Start To Get Audio Stream");
  try {
    const audioStream = ytdl(urlYtb, {
      quality: "highest",
      filter: "audioonly",
      requestOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36",
          Accept: "*/*",
          Referer: "https://www.youtube.com/",
        },
      },
    });

    const basicInfo = await ytdl.getBasicInfo(urlYtb);
    const titleSlug = basicInfo.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "");
    console.log("Get Audio Stream Complete");
    return { audioStream, titleSlug };
  } catch (err) {
    if (err instanceof Error) throw new Error(err.message);
    throw new Error("terjadi kesalahan get audio stream");
  }
};

export const linkToText = async ({
  urlYtb,
  language,
}: {
  urlYtb: string;
  language: string;
}) => {
  try {
    const { audioStream, titleSlug } = await getAudioStream(urlYtb);
    const outputDir = path.join(__dirname, "../assets", titleSlug);

    const splitFiles = await formattedMp3Split(audioStream, outputDir);

    console.log("memulai transcrypt");
    let allText = "";

    for (const filePath of splitFiles) {
      console.log("🔊 Transcribing:", filePath);
      const result = await AI_AGENT.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "gpt-4o-transcribe",
        response_format: "text",
      });

      allText += result + "\n\n";
    }

    console.log("memulai summarize");
    const summary = await askToChatGPT(`${allText}`);

    return {
      raw: allText,
      summary: summary,
    };
  } catch (err) {
    if (err instanceof Error) throw new Error(err.message);
    throw new Error("terjadi kesalahan link to text");
  }
};
