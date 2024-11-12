"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FC, forwardRef } from "react";
import { ScrollArea } from "../ui/scroll-area";

interface AutocompleteProps {
  onChange?: (...event: unknown[]) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}

export const Autocomplete: FC<AutocompleteProps> = forwardRef(
  ({ options, onChange, disabled = false }) => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");

    return (
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "justify-between",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : "Select option..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search option..." disabled={disabled} />{" "}
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <ScrollArea type="always">
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        if (disabled) return;
                        const result =
                          currentValue === value ? "" : currentValue;
                        setValue(result);
                        onChange?.(result);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
