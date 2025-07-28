import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import OpenAI from "openai";

const apiKey = process.env.NEXT_PUBLIC_OPEN_AI_KEY;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API = axios.create({
  baseURL: "http://localhost:3002",
});

export const AI_AGENT = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

export const askingTemplate = ({
  nameChannel,
  subs,
  desc,
  vidCount,
}: {
  nameChannel: string;
  subs: string;
  vidCount: string;
  desc: string;
}) =>
  `Berikut informasi channel YouTube:\n\nJudul: ${nameChannel}\nSubscribers: ${subs}\nTotal video: 106\nDeskripsi:${desc}\n\nTolong buatkan ringkasan mendetail isi channel ini dengan menjelaskan:\n1. Jenis konten apa saja yang dibuat,\n2. Topik-topik utama yang dibahas,\n3. Target audiens channel ini,\n4. Manfaat yang bisa didapatkan penonton dari channel ini,\n5. Contoh jenis video yang mungkin ada di channel ini.\n\nJawab dalam bahasa Indonesia dengan lengkap dan jelas.`;
