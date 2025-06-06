import { Moment } from "moment";

export interface DateSelectorProps {
  mode: "single" | "range";
  selectedColor?: string;
  onChange?: (val: string[] | { start: string | null; end: string | null }) => void;
  showPanel?: boolean
}
