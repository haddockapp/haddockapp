import { cn } from "@/lib/utils";

function Skeleton({
  className,
  loading = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { loading?: boolean }) {
  return (
    <div
      className={cn(
        loading && "animate-pulse rounded-md bg-primary/10",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
