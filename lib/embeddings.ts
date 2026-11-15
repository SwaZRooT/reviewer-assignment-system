import { pipeline } from '@xenova/transformers';

// We use a singleton pattern so the AI model only loads once
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractor: any = null;

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}