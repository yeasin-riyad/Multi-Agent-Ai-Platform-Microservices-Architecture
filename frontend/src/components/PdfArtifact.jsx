

import { useEffect, useState } from "react";

import {
  AlertCircle,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";

const PdfArtifact = ({
  artifact,
  onCollapse,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pdfUrl = artifact?.url;

  const title =
    artifact?.title || "PDF Document";

  const filename =
    artifact?.filename || "document.pdf";

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [pdfUrl]);

  const handleOpen = () => {
    if (!pdfUrl) return;

    window.open(
      pdfUrl,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");

    link.href = pdfUrl;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div
        className="
          h-12
          shrink-0
          border-b
          border-[#2b2b2b]
          bg-[#252526]
          flex
          items-center
          justify-between
          px-3
        "
      >
        {/* Title */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText
            size={17}
            className="text-red-400 shrink-0"
          />

          <span
            className="
              text-sm
              font-medium
              text-[#cccccc]
              truncate
            "
            title={title}
          >
            {title}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleOpen}
            disabled={!pdfUrl}
            title="Open PDF"
            className="
              flex
              items-center
              justify-center
              w-8
              h-8
              rounded
              text-[#858585]
              hover:text-[#e1e1e1]
              hover:bg-[#37373d]
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition-colors
            "
          >
            <ExternalLink size={16} />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!pdfUrl}
            title="Download PDF"
            className="
              flex
              items-center
              justify-center
              w-8
              h-8
              rounded
              text-[#858585]
              hover:text-[#e1e1e1]
              hover:bg-[#37373d]
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition-colors
            "
          >
            <Download size={16} />
          </button>

          <button
            type="button"
            onClick={onCollapse}
            title="Collapse Panel"
            className="
              flex
              items-center
              justify-center
              w-8
              h-8
              rounded
              text-[#858585]
              hover:text-[#e1e1e1]
              hover:bg-[#37373d]
              transition-colors
            "
          >
            <ChevronRight
              size={16}
              className="rotate-180"
            />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        className="
          relative
          flex-1
          min-h-0
          bg-[#525659]
          overflow-hidden
        "
      >
        {!pdfUrl ? (
          <PdfError
            message="No PDF URL was provided."
            showOpenButton={false}
          />
        ) : (
          <>
            {/* Loading */}
            {loading && !error && (
              <div
                className="
                  absolute
                  inset-0
                  z-10
                  flex
                  items-center
                  justify-center
                  bg-[#525659]
                "
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2
                    size={28}
                    className="animate-spin text-white"
                  />

                  <span className="text-sm text-white">
                    Loading PDF...
                  </span>
                </div>
              </div>
            )}

            {/* Error */}
            {error ? (
              <PdfError
                message="The PDF could not be loaded inside the preview."
                onOpen={handleOpen}
              />
            ) : (
              <iframe
                title={title}
                src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
                className="
                  relative
                  z-0
                  w-full
                  h-full
                  border-none
                  bg-white
                "
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const PdfError = ({
  message,
  onOpen,
  showOpenButton = true,
}) => {
  return (
    <div
      className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        bg-[#1e1e1e]
      "
    >
      <div className="text-center max-w-sm px-6">
        <AlertCircle
          size={42}
          className="
            mx-auto
            mb-4
            text-red-400
          "
        />

        <p className="text-sm text-[#cccccc]">
          PDF preview unavailable
        </p>

        <p className="text-xs text-[#858585] mt-2">
          {message}
        </p>

        {showOpenButton && onOpen && (
          <button
            type="button"
            onClick={onOpen}
            className="
              mt-4
              inline-flex
              items-center
              gap-2
              rounded-md
              bg-indigo-600
              px-4
              py-2
              text-sm
              text-white
              hover:bg-indigo-500
              transition-colors
            "
          >
            <ExternalLink size={15} />

            Open PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default PdfArtifact;