import OpenAI from "openai";
import { requireEnv } from "@/lib/env";

export function openaiServer() {
  return new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
}
