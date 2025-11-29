import type { Upload } from "./upload";

export interface Option {
  order: number;
  text: string;
  optionFiles: Upload[];
}