import * as React from "react";
import Link from "next/link";

export function MenuCard({ options }) {
  return (
    <div className="flex justify-center items-center">
      <Link href={options.link}>{options.name}</Link>
    </div>
  );
}
