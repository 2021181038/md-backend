import { parseMdResponse } from '../../utils/textUtils';

export const parseExtractedText = (rawText) =>
  parseMdResponse({ text: rawText }, 'online');
