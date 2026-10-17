import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, FileText, X } from "lucide-react";

import EditorHeader from "./EditorHeader";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import PdfArtifact from "./PdfArtifact";
import { setHasArtifacts } from "../redux/messageSlice";
import useMediaQuery from "../hooks/useMediaQuery";

const Artifact = () => {
  const dispatch = useDispatch();
  const { artifacts } = useSelector((state) => state.message);

  // ⭐ Desktop/ Mobile detection
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false); // ⭐ mobile drawer
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState("code");
  const [copied, setCopied] = useState(false);
  const [previewSrcDoc, setPreviewSrcDoc] = useState("");

  const activeArtifact =
    Array.isArray(artifacts) && artifacts.length > 0
      ? artifacts[artifacts.length - 1]
      : null;

  const artifactType = activeArtifact?.type?.toLowerCase() || "code";
  const isPdfArtifact = artifactType === "pdf";
  const isCodeArtifact =
    artifactType === "code" || artifactType === "project";

  const artifactTitle = activeArtifact?.title || "Artifact Viewer";

  const fileList = Array.isArray(activeArtifact?.files)
    ? activeArtifact.files
    : [];

  const currentFile = fileList[selectedFileIndex];

  const artifactKey =
    activeArtifact?.id ?? activeArtifact?.title ?? null;

  /* ─────────────────────────────────────────────────────────── */
  /*  New artifact arrive হলে                                 */
  /*  Desktop → expanded, Mobile → open drawer                 */
  /* ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!artifactKey) {
      setMobileOpen(false);
      return;
    }

    // Reset viewer state
    setSelectedFileIndex(0);
    setViewMode("code");
    setCopied(false);

    if (isDesktop) {
      // Desktop: expand side panel
      setCollapsed(false);
    } else {
      // Mobile: open full-screen drawer
      setMobileOpen(true);
    }
  }, [artifactKey, isDesktop]);

  /* ─── File list shrink হলে index adjust ───────────────────── */
  useEffect(() => {
    if (selectedFileIndex > fileList.length - 1) {
      setSelectedFileIndex(0);
    }
  }, [fileList.length, selectedFileIndex]);

  /* ─── Build preview srcDoc ────────────────────────────────── */
  useEffect(() => {
    if (!isCodeArtifact || fileList.length === 0) {
      setPreviewSrcDoc("");
      return;
    }

    const htmlFile =
      fileList.find((file) => file.name === "index.html")?.content || "";
    const cssFile =
      fileList.find((file) => file.name === "style.css")?.content || "";
    const jsFile =
      fileList.find((file) => file.name === "script.js")?.content || "";

    if (!htmlFile) {
      setPreviewSrcDoc(`
        <!DOCTYPE html>
        <html><body><h1>No index.html found</h1></body></html>
      `);
      return;
    }

    const cleanHtml = htmlFile.replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      "",
    );

    setPreviewSrcDoc(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 16px;
              font-family: sans-serif;
              background: #ffffff;
              color: #000000;
            }
            ${cssFile}
          </style>
        </head>
        <body>
          ${cleanHtml}
          <script>
            try { ${jsFile} } catch (err) {
              console.error(err);
              document.body.innerHTML +=
                '<div style="color:red;padding:10px;background:#fee;margin-top:20px;">' +
                '<strong>JS Runtime Error:</strong> ' + err.message + '</div>';
            }
          </script>
        </body>
      </html>
    `);
  }, [isCodeArtifact, fileList]);

  const handleCopy = async () => {
    if (!currentFile?.content) return;
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  /* ─── Mobile drawer close ─────────────────────────────────── */
  const handleMobileClose = () => {
    setMobileOpen(false);
    dispatch(setHasArtifacts(false));
  };

  // No valid artifact → render nothing
  if (
    !activeArtifact ||
    (artifactType !== "project" && artifactType !== "pdf")
  ) {
    return null;
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Reusable Artifact Content                                */
  /* ─────────────────────────────────────────────────────────── */

  const renderContent = (onCollapse) => (
    <div className="flex flex-col flex-1 h-full w-full">
      {isPdfArtifact ? (
        <PdfArtifact
          artifact={activeArtifact}
          onCollapse={onCollapse}
        />
      ) : (
        <>
          <EditorHeader
            artifactTitle={artifactTitle}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onToggleCollapse={onCollapse}
            onCopy={handleCopy}
            copied={copied}
            hasFile={!!currentFile}
          />

          {viewMode === "code" ? (
            <div className="flex flex-1 min-h-0 overflow-hidden">
              <FileExplorer
                fileList={fileList}
                selectedFileIndex={selectedFileIndex}
                onSelectFile={setSelectedFileIndex}
              />
              <CodeEditor currentFile={currentFile} />
            </div>
          ) : (
            <div className="flex-1 min-h-0 bg-white overflow-hidden relative">
              <iframe
                title="Artifact Live Preview"
                srcDoc={previewSrcDoc}
                sandbox="allow-scripts"
                className="w-full h-full border-none bg-white"
              />
            </div>
          )}
        </>
      )}
    </div>
  );

  /* ─────────────────────────────────────────────────────────── */
  /*  MOBILE — Full-screen drawer                              */
  /* ─────────────────────────────────────────────────────────── */

  if (!isDesktop) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-[#1e1e1e] flex flex-col"
          >
            {/* Mobile header with close */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-[#2b2b2b] bg-[#252526] shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {isPdfArtifact ? (
                  <FileText size={16} className="text-red-400 shrink-0" />
                ) : (
                  <FileText size={16} className="text-blue-400 shrink-0" />
                )}
                <span className="text-[13px] font-medium text-slate-200 truncate">
                  {artifactTitle}
                </span>
              </div>
              <button
                type="button"
                onClick={handleMobileClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
                aria-label="Close artifact"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {renderContent(handleMobileClose)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  DESKTOP — Side panel (collapsible)                       */
  /* ─────────────────────────────────────────────────────────── */

  return (
    <motion.div
      initial={{ width: "250px" }}
      animate={{ width: collapsed ? "50px" : "650px" }}
      transition={{ duration: 0.2 }}
      className="h-full flex shrink-0"
    >
      <div className="hidden lg:flex h-full border-l border-[#2b2b2b] flex-col overflow-hidden w-full bg-[#1e1e1e] font-sans text-[#cccccc]">
        {!collapsed ? (
          <div className="flex flex-col h-full w-full">
            {renderContent(() => setCollapsed(true))}
          </div>
        ) : (
          <div className="flex flex-col items-center pt-3 w-full h-full bg-[#252526] select-none">
            <button
              type="button"
              className="flex items-center justify-center w-7 h-7 rounded text-[#858585] hover:text-[#e1e1e1] hover:bg-[#37373d] transition-colors bg-transparent border-none cursor-pointer"
              onClick={() => setCollapsed(false)}
              title="Expand Panel"
            >
              <ChevronRight size={16} />
            </button>

            {isPdfArtifact && (
              <FileText size={18} className="mt-4 text-red-400" />
            )}
            {isCodeArtifact && (
              <FileText size={18} className="mt-4 text-blue-400" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Artifact;