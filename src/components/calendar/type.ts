import { type ReactNode } from "react";

export interface CalendarEvent {
  title: string;
  start: string | Date;
  end?: string | Date;
  [key: string]: any;
}

export interface CalendarProps {
  events: CalendarEvent[];
  startAccessor: string;
  endAccessor: string;
  color: (event: CalendarEvent) => string;
  renderContent: (event: CalendarEvent, index: number) => ReactNode;
}
