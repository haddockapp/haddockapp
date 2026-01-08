import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUploadProjectZipMutation } from "@/services/backendApi/projects";
import { useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";

function UploadZipDialog({ onClose }: { onClose?: () => void }) {
  const { projectId } = useParams<{ projectId: string }>();

  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [uploadZip, { isLoading }] = useUploadProjectZipMutation();

  const [dragActive, setDragActive] = useState(false);

  const acceptFile = useCallback(
    async (file: File) => {
      const isZip =
        file.type === "application/zip" ||
        file.name.toLowerCase().endsWith(".zip");

      if (!isZip) {
        toast({
          title: "Invalid file",
          description: "Please upload a .zip file.",
          variant: "destructive",
        });
        return;
      }

      await uploadZip({ projectId: projectId!, file })
        .unwrap()
        .then(() => {
          toast({
            title: "Upload complete",
            description: `${file.name} uploaded successfully.`,
          });
          onClose?.();
        })
        .catch((err) => {
          console.error(err);
          toast({
            title: "Upload failed",
            description: "Something went wrong while uploading.",
            variant: "destructive",
          });
        });
    },
    [onClose, projectId, toast, uploadZip]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
    // allow re-selecting same file
    e.currentTarget.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <>
      <Input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={onInputChange}
      />

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={[
          "group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/40",
          isLoading ? "pointer-events-none opacity-70" : "",
        ].join(" ")}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-base font-medium">
            {dragActive ? "Drop your ZIP here" : "Drag & drop a ZIP here"}
          </div>
          <div className="text-sm text-muted-foreground">
            or click to choose a file
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm">
            <div className="text-sm font-medium">Uploading…</div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={() => inputRef.current?.click()} disabled={isLoading}>
          Browse files
        </Button>
      </div>
    </>
  );
}

export default UploadZipDialog;
