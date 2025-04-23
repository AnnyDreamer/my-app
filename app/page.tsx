"use client";
import { useEffect, useState } from "react";
import { DateTable } from "@/components/custom/dateTable";
import { api, Event } from "@/lib/api";
import { format } from "date-fns";
export default function Home() {
  const [date, setDate] = useState(new Date());
  const currentDate = date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => {
    const fetchEvents = async () => {
      const events = await api.getAllEvents();
      if (events.length > 0) {
        events.forEach((event) => {
          console.log(event);
          if (format(new Date(event.date), "MM") === format(date, "MM")) {
            setEvents((prev) => [...prev, event]);
          }
        });
      }
    };
    fetchEvents();
  }, [date]);
  return (
    <div className="w-full">
      <div className="w-full mt-4 px-3">
        <div className="font-bold dark:text-white flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          <span>概览</span>
        </div>
        <div className="text-sm text-gray-500 px-2">{currentDate}</div>
      </div>
      <div className="border border-gray-200 m-4 rounded-lg">
        <DateTable />
      </div>
      <div className="font-bold dark:text-white flex items-center gap-1 m-4">
        <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
        <span>本月事项</span>
      </div>
      <div>
        {events.map((event) => (
          <div key={event.id} className="px-4 flex items-center gap-2">
            <span className="inline-block w-2 h-0.5 bg-blue-500 rounded-full"></span>
            <span>{event.title}</span>
            <span>{event.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
