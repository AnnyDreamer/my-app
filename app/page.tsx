"use client";
import { useState } from "react";
import { DateTable } from "@/components/custom/dateTable";
export default function Home() {
  const [date, setDate] = useState(new Date());
  const currentDate = date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="w-full">
      <div className="w-full mt-4 px-6 ">
        <div className="font-bold dark:text-white">概览</div>
        <div className="text-sm text-gray-500">{currentDate}</div>
      </div>
      <div className="border border-gray-200 m-4 rounded-lg">
        <DateTable />
      </div>
    </div>
  );
}
