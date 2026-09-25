import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function Resume({ resume }) {
  return (
    <div className="
      text-text-primary text-base font-normal leading-relaxed
      bg-surface border border-white/20
      rounded-xl p-6
      border-white/20
      prose prose-invert max-w-none
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Headers avec accent jaune subtil
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold my-6 text-text-primary border-l-4 border-accent pl-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold my-5 text-text-primary" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold my-4 text-text-secondary" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-semibold my-3 text-text-secondary" {...props} />
          ),

          // Paragraphes
          p: ({ node, ...props }) => (
            <p className="my-4 leading-relaxed text-text-primary" {...props} />
          ),

          // Listes
          ul: ({ node, ...props }) => (
            <ul className="my-4 space-y-2 ml-6" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-4 space-y-2 ml-6 list-decimal" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-text-primary marker:text-accent" {...props} />
          ),

          // Emphases et strong
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-accent" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-text-secondary" {...props} />
          ),

          // Citations
          blockquote: ({ node, ...props }) => (
            <blockquote className="
              border-l-4 border-accent/50
              bg-accent/5
              pl-4 pr-4 py-3 my-4
              italic text-text-secondary
              rounded-r-lg
            " {...props} />
          ),

          // Liens
          a: ({ node, ...props }) => (
            <a className="text-accent hover:text-accent-light underline decoration-accent/30 hover:decoration-accent transition-colors" {...props} />
          ),

          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-white/20">
              <table className="min-w-full divide-y divide-border" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-surface-light" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left text-xs font-semibold text-accent uppercase tracking-wider" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-surface divide-y divide-border" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-surface-light transition-colors" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-sm text-text-primary" {...props} />
          ),

          // Code
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="
                  bg-surface-light border border-white/20
                  text-accent
                  rounded px-1.5 py-0.5
                  text-sm font-mono
                " {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="
                bg-surface-dark border border-white/20
                rounded-lg p-4 my-4
                overflow-x-auto
                shadow-inner-glow
              ">
                <code className="text-sm font-mono text-text-primary" {...props}>
                  {children}
                </code>
              </pre>
            );
          },

          // Séparateur horizontal
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-white/20" {...props} />
          ),

          // Formules mathématiques
          div: ({ node, className, children, ...props }) => {
            if (className === "math math-display") {
              return (
                <div className="my-6 flex justify-center overflow-x-auto" {...props}>
                  <div className="px-6 py-4 bg-surface-light border border-white/20 rounded-lg">
                    {children}
                  </div>
                </div>
              );
            }
            return <div {...props}>{children}</div>;
          },
          span: ({ node, className, children, ...props }) => {
            if (className === "math math-inline") {
              return (
                <span className="mx-1 text-accent" {...props}>
                  {children}
                </span>
              );
            }
            return <span {...props}>{children}</span>;
          },
        }}
      >
        {resume}
      </ReactMarkdown>
    </div>
  );
}
