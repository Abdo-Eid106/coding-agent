import { tool } from '@langchain/core/tools';
import TurndownService from 'turndown';
import * as cheerio from 'cheerio';
import z from 'zod';

const turndownService = new TurndownService();

function textToMarkdown(text: string) {
  const $ = cheerio.load(text);

  // Extract the body and remove irrelevant elements.
  $('script, style, noscript, svg').remove();

  const bodyHtml = $('body').html() ?? '';
  return turndownService.turndown(bodyHtml);
}

export interface FetchOptions {
  timeout?: number | undefined;
  format?: 'text' | 'markdown' | undefined;
}

export async function fetchUrl(url: string, options: FetchOptions) {
  const { timeout = 5000, format = 'text' } = options;

  const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const text = await res.text();
  if (format == 'text') return text;
  return textToMarkdown(text);
}

export const fetchTool = tool(
  async ({ url, timeout, format }) => {
    const content = await fetchUrl(url, { timeout, format });
    return { content };
  },
  {
    name: 'fetch',
    description:
      'Fetches content from a URL and returns it as raw text or cleaned Markdown.',
    schema: z.object({
      url: z.string().describe('The URL to fetch content from.'),
      timeout: z
        .number()
        .optional()
        .describe('Request timeout in milliseconds (defaults to 5000).'),
      format: z
        .enum(['text', 'markdown'])
        .optional()
        .describe("Output format: 'text' or 'markdown' (defaults to 'text')."),
    }),
  },
);
