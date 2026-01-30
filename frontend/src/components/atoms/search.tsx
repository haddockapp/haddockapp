import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const SearchBar = ({
  searchValue,
  onChangeSearchValue,
}: {
  searchValue: string;
  onChangeSearchValue: (v: string) => void;
}) => {
  const [searchSubmittedOutline, setSearchSubmittedOutline] = useState(false);
  const [searchSubmittedShadow, setSearchSubmittedShadow] = useState(false);
  function handleSearch() {
    setSearchSubmittedOutline(true);
    setSearchSubmittedShadow(true);
  }

  useEffect(() => {
    if (searchSubmittedOutline) {
      // Wait 3 sec
      setTimeout(() => {
        setSearchSubmittedOutline(false);
      }, 150);
    }
  }, [searchSubmittedOutline]);

  useEffect(() => {
    if (searchSubmittedShadow) {
      // Wait 3 sec
      setTimeout(() => {
        setSearchSubmittedShadow(false);
      }, 1000);
    }
  }, [searchSubmittedShadow]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "s"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <label
      className={cn(
        "relative inline-flex origin-center rounded-full text-primary dark:text-primary/90",
        "group transform-gpu transition-all ease-in-out",
        "relative",
        "w-full",
        // searchSubmitted
        //   ? "scale-95 shadow-red-500/30 duration-100"
        //   : "scale-100 shadow-red-500/0",
        "before:absolute before:top-0 before:left-0 before:h-full before:w-full before:transform-gpu before:rounded-full before:transition-all before:duration-700 before:ease-in-out before:content-['']",
        searchSubmittedShadow
          ? "before:shadow-[0px_0px_0px_5px_blue] before:blur-2xl"
          : "before:shadow-[0px_0px_1px_0px_#FFFFFF00] before:blur-0",
        searchSubmittedOutline
          ? "scale-90 duration-75"
          : "duration-300 hover:scale-105"
      )}
      htmlFor="search"
    >
      <input
        ref={inputRef}
        className={cn(
          "peer max-w-10 transform-gpu rounded-full p-2 pl-10 transition-all ease-in-out focus:w-full focus:max-w-full",
          // BACKGROUND
          "bg-white/70 hover:bg-white/80 dark:bg-primary/10 dark:hover:bg-primary/20",
          // OUTLINE
          "-outline-offset-1 outline outline-1",
          searchSubmittedOutline
            ? "outline-primary/50 duration-150"
            : "outline-neutral-200/0 duration-300 hover:outline-neutral-200/100 dark:outline-neutral-800/0 dark:focus:placeholder-neutral-300/100 dark:hover:outline-neutral-800/100",
          // PLACEHOLDER
          "placeholder-neutral-300/0 focus:placeholder-neutral-300/100 dark:placeholder-neutral-700/0 dark:focus:placeholder-neutral-700/100"
        )}
        id="search"
        onBlur={() => {
          setSearchSubmittedOutline(false);
          setSearchSubmittedShadow(false);
          onChangeSearchValue("");
        }}
        onChange={(e) => onChangeSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        onSubmit={handleSearch}
        placeholder="Search"
        type="search"
        value={searchValue}
      />
      <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-5 text-primary/30 transition-colors peer-focus:text-primary/50 dark:text-primary/70" />
    </label>
  );
};
