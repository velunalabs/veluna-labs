import moment, { type MomentInput } from "moment";

// Full date: "April 23, 2025"
export const formattedFullDate = (date: MomentInput): string =>
  moment(date).format("MMMM DD, YYYY");

// Half date: "Apr 23, 2025"
export const formattedHalfDate = (date: MomentInput): string =>
  moment(date).format("MMM DD, YYYY");

// Short date: "23-04-2025"
export const formattedDate = (date: MomentInput): string =>
  moment(date).format("DD-MM-YYYY");

// Time: "04:30 PM"
export const formattedTime = (time: MomentInput): string =>
  moment(time).format("hh:mm A");

// Date + time: "23-04-2025 04:30:00 PM"
export const formattedDateTime = (datetime: MomentInput): string =>
  moment(datetime).format("DD-MM-YYYY hh:mm:ss A");

// Full Date + Time: "April 23, 2025 04:30 PM"
export const formattedFullDateTime = (datetime: MomentInput): string =>
  moment(datetime).format("MMMM DD, YYYY hh:mm:ss A");
