import React, { useEffect, useState } from "react";
import moment, { type Moment } from "moment";
import { motion } from "framer-motion";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarProps } from "./type";



const Calendar: React.FC<CalendarProps> = ({
  events,
  startAccessor,
  endAccessor,
  color,
  renderContent,
}) => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDay, setSelectedDay] = useState<Moment | null>(null);

  const startDate = moment(currentDate).startOf("month").startOf("week");
  const endDate = moment(currentDate).endOf("month").endOf("week").add(1, "day");
  const today = moment();

  const days: Moment[] = [];
  let day = startDate.clone();
  while (day.isBefore(endDate, "day")) {
    days.push(day.clone());
    day.add(1, "day");
  }

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.clone().subtract(1, "month"));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.clone().add(1, "month"));
    setSelectedDay(null);
  };

  const handleDateClick = (day: Moment) => {
    setSelectedDay(day);
  };

  useEffect(() => {
    setSelectedDay(today);
  }, [events]);

  const isToday = (day: Moment) => {
    return day.isSame(moment(), "day");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 mt-5 w-full">
      {/* Calendar Section */}
      <motion.div
        className="w-full lg:w-2/3 bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-md border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-4">
            <motion.h2
              className="text-xl sm:text-2xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={currentDate.format("MMMM YYYY")}
              transition={{ duration: 0.3 }}
            >
              {currentDate.format("MMMM YYYY")}
            </motion.h2>
            <div className="hidden sm:flex items-center justify-center px-3 py-1 bg-blue-100 rounded-full border-2 border-blue-600">
              <CalendarIcon className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-600">
                {moment().format("dddd, MMM D")}
              </span>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <motion.button
              onClick={handlePrevMonth}
              className="bg-white border p-1.5 sm:p-2 rounded-full hover:bg-gray-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
            <motion.button
              onClick={handleNextMonth}
              className="bg-white border p-1.5 sm:p-2 rounded-full hover:bg-gray-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-gray-500 text-xs sm:text-sm md:text-base mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center font-semibold p-1 sm:p-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, index) => {
            const dayEvents = events.filter(
              (e) =>
                moment(e[startAccessor]).isSameOrBefore(day, "day") &&
                moment(e[endAccessor] || e[startAccessor]).isSameOrAfter(day, "day")
            );
            const isCurrentMonth = day.isSame(currentDate, "month");
            const isSelected = selectedDay?.isSame(day, "day");

            return (
              <motion.div
                key={index}
                onClick={() => handleDateClick(day)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-1 h-12 xs:h-16 sm:h-20 md:h-24 lg:h-28 w-full text-start cursor-pointer rounded-lg sm:rounded-xl flex flex-col border ${
                  isToday(day) ? "border-primary" : "border-gray-200"
                } ${isCurrentMonth ? "bg-gray-50" : "bg-gray-100/50 text-gray-400"} ${
                  isSelected ? "ring-2 ring-primary/30 border-primary" : ""
                } hover:bg-gray-100`}
              >
                <div className="font-medium md:p-2">
                  <span
                    className={`text-xs md:text-sm ${
                      isSelected ? "text-primary" : "border-gray-200"
                    }`}
                  >
                    {day.format("D")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {dayEvents.slice(0, 1).map((event, idx) => (
                    <motion.span
                      key={idx}
                      style={{ backgroundColor: color(event) }}
                      className="p-1 md:p-2 rounded-full md:rounded-2xl truncate text-[10px] md:text-xs text-white font-semibold shadow-xs border"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="hidden md:flex capitalize">
                        {event.title}
                      </span>
                    </motion.span>
                  ))}
                  {dayEvents.length > 1 && (
                    <span className="text-xs text-blue-500 hidden md:flex">
                      + {dayEvents.length - 1} more
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Side Panel */}
      <motion.div
        className="w-full lg:w-1/3 bg-white p-4 rounded-xl shadow-md border"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="border-b mb-3 pb-2 flex justify-between items-center">
          <h3 className="text-md font-semibold text-gray-700">
            {(selectedDay || today).format("dddd, MMMM D YYYY")}
          </h3>
          <div className="flex gap-2">
            <select
              value={currentDate.month()}
              onChange={(e) =>
                setCurrentDate(currentDate.clone().month(Number(e.target.value)))
              }
              className="rounded-xl p-2 border text-gray-700"
            >
              {moment.months().map((month, idx) => (
                <option key={idx} value={idx}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={currentDate.year()}
              onChange={(e) =>
                setCurrentDate(currentDate.clone().year(Number(e.target.value)))
              }
              className="rounded-xl p-2 border text-gray-700"
            >
              {Array.from({ length: 100 }, (_, i) => moment().year() - 10 + i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="py-3">
          {events.some(
            (e) =>
              moment(e[startAccessor]).isSameOrBefore(selectedDay || today, "day") &&
              moment(e[endAccessor] || e[startAccessor]).isSameOrAfter(
                selectedDay || today,
                "day"
              )
          ) ? (
            events
              .filter(
                (e) =>
                  moment(e[startAccessor]).isSameOrBefore(
                    selectedDay || today,
                    "day"
                  ) &&
                  moment(e[endAccessor] || e[startAccessor]).isSameOrAfter(
                    selectedDay || today,
                    "day"
                  )
              )
              .map((event, idx) => renderContent(event, idx))
          ) : (
            <p className="text-sm text-gray-500">
              No events scheduled. <br />
              <span className="font-semibold">Time for a break ☕️</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Calendar;
