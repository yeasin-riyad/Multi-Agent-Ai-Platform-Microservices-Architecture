import { ExternalLink, X, Check, Copy } from 'lucide-react'; 
import { useState } from 'react'; 
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Language color mapping for dynamic tag aesthetics
const LANGUAGE_COLORS = {
  js: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  javascript: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  ts: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  typescript: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  py: { bg: 'bg-sky-500/10', text: 'text-sky-400' },
  python: { bg: 'bg-sky-500/10', text: 'text-sky-400' },
  html: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  css: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  json: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  bash: { bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
  sh: { bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
};

// Sub-component for individual Code Block layout management
const CodeBlock = ({ children, language, ...props }) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n\$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get color theme configuration fallback to default
  const theme = LANGUAGE_COLORS[language?.toLowerCase()] || { bg: 'bg-slate-500/10', text: 'text-slate-400' };

  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950/50">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-slate-900/60 px-4 py-2 text-xs font-mono">
        {language ? (
          <span className={`rounded px-2 py-0.5 font-semibold tracking-wide uppercase ${theme.bg} ${theme.text}`}>
            {language}
          </span>
        ) : (
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Code</span>
        )}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body Canvas */}
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        showLineNumbers={true}
        wrapLines={true}
        lineNumberStyle={{ color: 'rgba(255,255,255,0.2)', minWidth: '2.25em', paddingRight: '1rem', textAlign: 'right' }}
        customStyle={{
          margin: 0,
          padding: '1rem 0.5rem',
          background: 'transparent',
          fontSize: '0.875rem',
        }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

const MessageBubble = ({ role, content, images }) => { 
  const isUser = role === "user"; 
  const [lightBox, setLightBox] = useState(null); 

  return ( 
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}> 
      <div className={`w-fit max-w-[92vw] md:max-w-[72%] px-4 py-2.5 rounded-2xl break-words overflow-hidden leading-relaxed ${isUser ? "bg-gradient-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm" : "text-slate-200 rounded-tl-sm"}`}> 
        
        {/* Render content markdown */}
        <Markdown 
          remarkPlugins={[remarkGfm]}
          components={{ 
            h1: ({ children }) => <h1 className='text-2xl font-bold mt-5 mb-3'>{children}</h1>,
            h2: ({ children }) => <h2 className='text-xl font-semibold mt-4 mb-2'>{children}</h2>,
            h3: ({ children }) => <h3 className='text-lg font-semibold mt-3 mb-2'>{children}</h3>,
            p: ({ children }) => <p className='mb-3 whitespace-pre-wrap break-words'>{children}</p>,
            ul: ({ children }) => <ul className='list-disc pl-5 space-y-1 my-2'>{children}</ul>,
            ol: ({ children }) => <ol className='list-decimal pl-5 space-y-1 my-2'>{children}</ol>,
            table: ({ children }) => <table className='min-w-full border border-white/10 my-4 border-collapse overflow-hidden rounded-xl'>{children}</table>,
            th: ({ children }) => <th className='border border-white/10 bg-white/10 px-3 py-2 text-left font-semibold'>{children}</th>,
            td: ({ children }) => <td className='border border-white/10 bg-white/5 px-3 py-2'>{children}</td>,
            
            a: ({ href, children }) => (
              <a 
                href={href}
                target='_blank'
                rel="noreferrer"
                className={`${isUser ? "text-sky-200" : "text-indigo-400"} underline inline-flex items-center gap-1 hover:opacity-80`}
              >
                {children}
                <ExternalLink size={14} className="inline"/>
              </a>
            ),

            // Code Component Route
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              return inline ? (
                <code className={`px-1.5 py-0.5 rounded-md text-sm font-mono ${isUser ? "bg-white/20 text-white" : "bg-white/10 text-rose-400"}`} {...props}>
                  {children}
                </code>
              ) : (
                <CodeBlock language={language} {...props}>
                  {children}
                </CodeBlock>
              );
            }
          }}
        >
          {content}
        </Markdown>

        {/* Render attached images */}
        {images?.length > 0 && ( 
          <div className='flex flex-wrap gap-3 mt-4'> 
            {images.map((img, i) => ( 
              <img 
                key={i} 
                src={img} 
                alt=""
                loading="lazy" 
                onClick={() => setLightBox(img)} 
                onError={(e) => e.currentTarget.remove()} 
                className='w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition' 
              /> 
            ))} 
          </div> 
        )} 
      </div> 

      {/* Lightbox Overlay */}
      {lightBox && (
        <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6'> 
          <button 
            className='absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 rounded-full p-2' 
            onClick={() => setLightBox(null)}
          > 
            <X /> 
          </button> 
          <img 
            src={lightBox} 
            alt="Enlarged view"
            className='max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain'
          /> 
        </div> 
      )}
    </div> 
  ); 
}; 

export default MessageBubble;
 