// import { Code2, PanelRightClose } from "lucide-react";
// import { useState } from "react";
// import { useSelector } from "react-redux";
// import { motion } from "motion/react";

// const Artifact = () => {
//   const { artifacts } = useSelector((state) => state.message);
//   const [collapsed, setCollapsed] = useState(false);

//   console.log(artifacts)

//   if (artifacts.length === 0) return null; // React components should return null instead of undefined when rendering nothing

//   return (
//     <motion.div 
//       initial={{ width: "250px" }} 
//       animate={{ width: collapsed ? "60px" : "250px" }} // Smoothly animate the width when collapsing
//       transition={{ duration: 0.2 }}
//     >
//       <div className="hidden lg:flex h-full border border-white/[0.06] flex-col overflow-hidden shrink-0 w-full">
//         {!collapsed ? (
//           <div className="flex flex-col h-full bg-[#0d0f14]">
//             <div className="h-14 px-4 border-b border-white/[0.06] flex items-center gap-3 shrink-0">
//               <button
//                 className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 
//                 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
//                 onClick={() => setCollapsed((prev) => !prev)}
//               >
//                 <PanelRightClose size={16} />
//               </button>

//               <div className="flex items-center gap-2 flex-1 min-w-0">
//                 <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
//                   <Code2 className="text-indigo-400" size={12} />
//                 </div>

//                 <div className="text-[13px] font-medium text-slate-200 truncate">
//                   {artifacts[0]?.title}
//                 </div>
//               </div>

//               <div>
//                 </div>
//             </div>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center pt-4 h-full bg-[#0d0f14]">
//             {/* What shows up when collapsed (e.g., just the toggle button turned around) */}
//             <button
//               className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 
//               hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
//               onClick={() => setCollapsed((prev) => !prev)}
//             >
//               <PanelRightClose size={16} className="rotate-180" /> {/* Flips the arrow direction */}
//             </button>
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// export default Artifact;








import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { ChevronRight, FileText } from "lucide-react";

import EditorHeader from "./EditorHeader";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import PdfArtifact from "./PdfArtifact";

const Artifact = () => {
  const { artifacts } = useSelector((state) => state.message);

  const [collapsed, setCollapsed] = useState(true);
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

  // Stable key so we only reset UI when a genuinely new artifact arrives
  const artifactKey =
    activeArtifact?.id ?? activeArtifact?.title ?? null;

  /* ------------------------------------------------------------------
   * Auto-open the artifact panel as soon as a response is available
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (!artifactKey) {
      return;
    }
    // New artifact arrived → expand the panel and reset the viewer state
    setCollapsed(false);
    setSelectedFileIndex(0);
    setViewMode("code");
    setCopied(false);
  }, [artifactKey]);

  // Keep the selected index valid if the file list shrinks
  useEffect(() => {
    if (selectedFileIndex > fileList.length - 1) {
      setSelectedFileIndex(0);
    }
  }, [fileList.length, selectedFileIndex]);

  /* ------------------------------------------------------------------
   * Build the live-preview document (index.html + style.css + script.js)
   * ------------------------------------------------------------------ */
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
        <html>
          <body>
            <h1>No index.html found</h1>
          </body>
        </html>
      `);
      return;
    }

    const cleanHtml = htmlFile.replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      ""
    );

    const compiledSource = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >
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
            try {
              ${jsFile}
            } catch (err) {
              console.error(err);
              document.body.innerHTML +=
                '<div style="color:red;padding:10px;background:#fee;margin-top:20px;">' +
                '<strong>JS Runtime Error:</strong> ' +
                err.message +
                '</div>';
            }
          </script>
        </body>
      </html>
    `;

    setPreviewSrcDoc(compiledSource);
  }, [isCodeArtifact, fileList]);

  const handleCopy = async () => {
    if (!currentFile?.content) {
      return;
    }
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  if (!activeArtifact || (artifactType !== "project" && artifactType !== "pdf")) {
  return null;
}

  return (
    <motion.div
      initial={{ width: "250px" }}
      animate={{ width: collapsed ? "50px" : "650px" }}
      transition={{ duration: 0.2 }}
      className="h-full flex shrink-0"
    >
      <div
        className="
          hidden
          lg:flex
          h-full
          border-l
          border-[#2b2b2b]
          flex-col
          overflow-hidden
          w-full
          bg-[#1e1e1e]
          font-sans
          text-[#cccccc]
        "
      >
        {!collapsed ? (
          <div className="flex flex-col h-full w-full">
            {isPdfArtifact ? (
              <PdfArtifact
                artifact={activeArtifact}
                onCollapse={() => setCollapsed(true)}
              />
            ) : (
              <>
                <EditorHeader
                  artifactTitle={artifactTitle}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  onToggleCollapse={() => setCollapsed(true)}
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
                  <div
                    className="
                      flex-1
                      min-h-0
                      bg-white
                      overflow-hidden
                      relative
                    "
                  >
                    <iframe
                      title="Artifact Live Preview"
                      srcDoc={previewSrcDoc}
                      sandbox="allow-scripts"
                      className="
                        w-full
                        h-full
                        border-none
                        bg-white
                      "
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div
            className="
              flex
              flex-col
              items-center
              pt-3
              w-full
              h-full
              bg-[#252526]
              select-none
            "
          >
            <button
              type="button"
              className="
                flex
                items-center
                justify-center
                w-7
                h-7
                rounded
                text-[#858585]
                hover:text-[#e1e1e1]
                hover:bg-[#37373d]
                transition-colors
                bg-transparent
                border-none
                cursor-pointer
              "
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