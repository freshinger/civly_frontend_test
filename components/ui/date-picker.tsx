"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid as isValidFn } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ISO_FMT = "yyyy-MM-dd";
const DISP_FMT = "MMMM dd, yyyy";

export type DatePickerInputProps = {
  value: Date | null;
  onChange: (d: string) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string; // for the native input
};

export function DatePickerInput({
  value,
  onChange,
  disabled = false,
  id,
  name,
  className,
  placeholder = "YYYY-MM-DD",
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date>(value ?? new Date());

  // keep calendar month synced with selected value
  React.useEffect(() => {
    if (value) setMonth(value);
  }, [value]);

  const inputValue = value ? format(value, ISO_FMT) : "";

  return (
    <div className={cn("relative flex gap-2", className)}>
      {/* Native date input (indicator hidden) */}
      <Input
        type="date"
        id={id}
        name={name}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "bg-background pr-10 appearance-none",
          "[&::-webkit-calendar-picker-indicator]:hidden",
          "[&::-moz-calendar-picker-indicator]:hidden",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
        title={value ? format(value, DISP_FMT) : "Pick a date"}
        onChange={(e) => {
          if (disabled) return;
          const s = e.target.value; // yyyy-MM-dd
          if (!s) {
            onChange("");
            return;
          }
          const d = parse(s, ISO_FMT, new Date());
          onChange(isValidFn(d) ? d.toISOString() : "");
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (value) setMonth(value);
            setOpen(true);
          }
          if (e.key === "Escape") setOpen(false);
        }}
      />

      {/* Calendar button + popover */}
      <Popover
        open={!disabled && open}
        onOpenChange={(o) => !disabled && setOpen(o)}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            onClick={() => {
              if (disabled) return;
              if (value) setMonth(value);
              setOpen(true);
            }}
            aria-label="Open calendar"
          >
            <CalendarIcon className="size-3.5" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={value ?? undefined}
            month={month}
            onMonthChange={setMonth}
            onSelect={(d) => {
              if (disabled) return;
              onChange(d?.toISOString() ?? "");
              if (d) setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
