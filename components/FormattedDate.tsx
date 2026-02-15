"use client";

import { useState, useEffect } from "react";

interface FormattedDateProps {
  date: string | null | undefined;
  format?: "date" | "time" | "datetime";
  options?: Intl.DateTimeFormatOptions;
}

export default function FormattedDate({
  date,
  format = "date",
  options,
}: FormattedDateProps) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    if (!date) {
      setFormatted("");
      return;
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      setFormatted("");
      return;
    }

    const defaultOptions: Intl.DateTimeFormatOptions =
      format === "date"
        ? { year: "numeric", month: "2-digit", day: "2-digit" }
        : format === "time"
        ? { hour: "2-digit", minute: "2-digit" }
        : {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          };

    const finalOptions = { ...defaultOptions, ...options };
    setFormatted(dateObj.toLocaleDateString("es-ES", finalOptions));
  }, [date, format, options]);

  return <span>{formatted}</span>;
}



