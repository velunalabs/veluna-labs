import React, { useState, useEffect } from "react";
import moment, { Moment } from "moment";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formattedDate, formattedHalfDate } from "../../utils/date-formatter";
import { DateSelectorProps } from "./type";

const isToday = (day: Moment) => moment().isSame(day, "day");

function DatePicker({
  mode = "single",
  selectedColor = "#3b82f6",
  onChange,
  showPanel = true,
}: DateSelectorProps) {
  const [currentDate, setCurrentDate] = useState<Moment>(moment());
  const [selectedDates, setSelectedDates] = useState<Moment[]>([]);
  const [range, setRange] = useState<{
    start: Moment | null;
    end: Moment | null;
  }>({ start: null, end: null });

  const updateValue = (val: any) => {
    let formattedVal;

    if (mode === "single") {
      formattedVal = val.map((d: Moment) => d.format("DD-MM-YYYY"));
    } else {
      formattedVal = {
        start: val.start ? val.start.format("DD-MM-YYYY") : null,
        end: val.end ? val.end.format("DD-MM-YYYY") : null,
      };
    }

    onChange?.(formattedVal);
  };

  const startDay = currentDate.clone().startOf("month").startOf("week");
  const endDay = currentDate.clone().endOf("month").endOf("week").add(1, "day");
  const day = startDay.clone().subtract(1, "day");
  const days: Moment[] = [];

  while (day.isBefore(endDay, "day")) {
    days.push(day.add(1, "day").clone());
  }

  const handleDateClick = (d: Moment) => {
    if (mode === "single") {
      const exists = selectedDates.some((sel) => sel.isSame(d, "day"));
      const newDates = exists
        ? selectedDates.filter((sel) => !sel.isSame(d, "day"))
        : [...selectedDates, d];

      setSelectedDates(newDates);
      updateValue(newDates);
    } else {
      let newRange;
      if (!range.start || (range.start && range.end)) {
        newRange = { start: d, end: null };
      } else {
        newRange = d.isBefore(range.start)
          ? { start: d, end: range.start }
          : { start: range.start, end: d };
      }

      setRange(newRange);
      updateValue(newRange);
    }
  };

  const isSelected = (d: Moment) => {
    if (mode === "single") {
      return selectedDates.some((sel) => sel.isSame(d, "day"));
    } else {
      return (
        (range.start && d.isSame(range.start, "day")) ||
        (range.end && d.isSame(range.end, "day"))
      );
    }
  };

  const isInRange = (d: Moment) =>
    mode === "range" &&
    range.start &&
    range.end &&
    d.isAfter(range.start, "day") &&
    d.isBefore(range.end, "day");

  return (
    <div
      className={`flex gap-3 flex-col md:flex-row mx-auto ${
        showPanel ? "max-w-3xl" : "max-w-sm"
      } w-full`}
    >
      <motion.div
        className="w-full bg-white p-4 rounded-xl border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-5">
          <motion.h2 className="text-lg font-semibold text-gray-800">
            {currentDate.format("MMMM YYYY")}
          </motion.h2>
          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={() =>
                setCurrentDate(currentDate.clone().subtract(1, "month"))
              }
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() =>
                setCurrentDate(currentDate.clone().add(1, "month"))
              }
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-gray-500 text-sm font-medium mb-3">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const isCurrentMonth = d.isSame(currentDate, "month");
            const selected = isSelected(d);
            const today = isToday(d);
            const inRange = isInRange(d);

            return (
              <div key={i} className="w-full flex items-center justify-center">
                <motion.div
                  onClick={() => handleDateClick(d)}
                  className={`relative size-6 p-1 md:size-10 cursor-pointer select-none rounded-full flex items-center justify-center transition-all duration-150
                    ${!isCurrentMonth ? "text-gray-400" : "text-gray-800"}
                    ${selected ? "text-white" : ""} ${
                    inRange ? "rounded-lg md:rounded-xl" : "rounded-full"
                  }
                    `}
                  style={{
                    backgroundColor: selected
                      ? selectedColor
                      : inRange
                      ? `${selectedColor}33`
                      : isCurrentMonth && today
                      ? "#e5e7eb"
                      : "transparent",
                  }}
                >
                  <span className="text-xs md:text-sm font-semibold">
                    {d.date()}
                  </span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {showPanel && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 w-full mx-auto md:h-auto h-72 overflow-y-auto">
          <div className="border-b border-gray-200 mb-3 pb-2 flex w-full items-center justify-between">
            <h3 className="text-md font-semibold text-gray-700">
              Selected Dates
            </h3>
            <div className="flex gap-2 items-center">
              <select
                className="rounded-xl block w-full p-2 text-gray-700 bg-white border border-gray-200"
                value={currentDate.month()}
                onChange={(e) =>
                  setCurrentDate(
                    currentDate.clone().month(Number(e.target.value))
                  )
                }
              >
                {moment.months().map((month, idx) => (
                  <option key={idx} value={idx}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl block w-full p-2 text-gray-700 bg-white border border-gray-200"
                value={currentDate.year()}
                onChange={(e) =>
                  setCurrentDate(
                    currentDate.clone().year(Number(e.target.value))
                  )
                }
              >
                {Array.from({ length: 100 }, (_, i) => {
                  const year = moment().year() - 10 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {mode === "single" ? (
            selectedDates.length === 0 ? (
              <p className="text-gray-500">No dates selected</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                {selectedDates
                  .sort((a, b) => a.valueOf() - b.valueOf())
                  .map((date, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 rounded-full text-white text-center font-semibold text-sm truncate"
                      style={{ backgroundColor: selectedColor }}
                      title={date.format("MMM D, YYYY")}
                    >
                      {formattedDate(date)}
                    </li>
                  ))}
              </ul>
            )
          ) : !range.start ? (
            <p className="text-gray-500">No range selected</p>
          ) : (
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
              <div
                className="px-4 py-2 rounded-full text-white truncate"
                style={{ backgroundColor: selectedColor }}
              >
                {formattedHalfDate(range.start)}
              </div>
              <span className="text-gray-500 font-semibold">to</span>
              <div
                className="px-4 py-2 rounded-full text-white truncate"
                style={{ backgroundColor: selectedColor }}
              >
                {range.end ? formattedHalfDate(range.end) : "..."}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DatePicker;
