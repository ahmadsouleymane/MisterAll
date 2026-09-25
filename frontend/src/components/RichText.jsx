import React, { Component, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

/**
 * ErrorBoundary - Capture les erreurs de rendu (notamment KaTeX)
 */
class RichTextErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('RichText render error:', error.message)
  }

  render() {
    if (this.state.hasError) {
      // Fallback: afficher le texte brut sans formatage
      return (
        <span className="text-text-secondary">
          {this.props.fallbackText || this.props.children}
        </span>
      )
    }
    return this.props.children
  }
}

/**
 * Pré-traitement du contenu pour corriger les erreurs LaTeX courantes
 */
function preprocessContent(content) {
  if (!content || typeof content !== 'string') return ''

  let processed = content

  // 1. Corriger les doubles backslashes qui cassent le LaTeX
  // \\\\ → \\ (pour les environnements comme les fractions)
  processed = processed.replace(/\\\\\\\\(?=[a-zA-Z])/g, '\\')

  // 2. Corriger les commandes LaTeX mal échappées
  // \\frac → \frac, \\sum → \sum, etc.
  const latexCommands = [
    'frac', 'sqrt', 'sum', 'prod', 'int', 'lim', 'infty',
    'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'theta', 'lambda', 'mu', 'pi', 'sigma', 'omega',
    'Delta', 'Sigma', 'Omega', 'Pi',
    'sin', 'cos', 'tan', 'log', 'ln', 'exp',
    'cdot', 'times', 'div', 'pm', 'mp', 'leq', 'geq', 'neq', 'approx',
    'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow', 'leftrightarrow',
    'xrightarrow', 'xleftarrow',
    'text', 'textbf', 'textit', 'mathrm', 'mathbf',
    'begin', 'end', 'left', 'right',
    'overline', 'underline', 'hat', 'vec', 'bar',
    'partial', 'nabla', 'forall', 'exists',
    'cup', 'cap', 'subset', 'supset', 'in', 'notin',
    'binom', 'choose'
  ]

  // Corriger \\commande → \commande (seulement à l'intérieur des $ ou $$)
  for (const cmd of latexCommands) {
    // Dans les formules inline $...$
    processed = processed.replace(
      new RegExp(`(\\$[^$]*?)\\\\\\\\${cmd}([^$]*?\\$)`, 'g'),
      `$1\\${cmd}$2`
    )
    // Dans les formules display $$...$$
    processed = processed.replace(
      new RegExp(`(\\$\\$[^$]*?)\\\\\\\\${cmd}([^$]*?\\$\\$)`, 'g'),
      `$1\\${cmd}$2`
    )
  }

  // 3. Corriger les accolades non fermées dans les formules
  // Compter les { et } dans chaque formule
  processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
    const openBraces = (formula.match(/\{/g) || []).length
    const closeBraces = (formula.match(/\}/g) || []).length
    if (openBraces > closeBraces) {
      return `$$${formula}${'}'.repeat(openBraces - closeBraces)}$$`
    }
    return match
  })

  processed = processed.replace(/\$([^$]+)\$/g, (match, formula) => {
    // Éviter les $$ qui sont déjà gérés
    if (match.startsWith('$$')) return match
    const openBraces = (formula.match(/\{/g) || []).length
    const closeBraces = (formula.match(/\}/g) || []).length
    if (openBraces > closeBraces) {
      return `$${formula}${'}'.repeat(openBraces - closeBraces)}$`
    }
    return match
  })

  // 4. Corriger les formules avec des espaces problématiques
  // $ formule $ → $formule$
  processed = processed.replace(/\$\s+([^$]+?)\s+\$/g, '$$$1$$')

  // 5. Supprimer les $ orphelins qui ne forment pas de formule
  // Un $ seul suivi d'un espace et de texte non-math
  processed = processed.replace(/\$\s+(?=[a-zA-Z]{5,})/g, '')

  // 6. Corriger les \n littéraux dans les formules (qui cassent le parsing)
  processed = processed.replace(/\$([^$]*?)\\n([^$]*?)\$/g, '$$$1 $2$$')

  // 7. Échapper les underscores isolés hors formules math
  // Ne pas toucher aux _ dans les formules $...$
  let inMath = false
  let result = ''
  for (let i = 0; i < processed.length; i++) {
    const char = processed[i]
    if (char === '$') {
      inMath = !inMath
      result += char
    } else if (char === '_' && !inMath) {
      // Vérifier si c'est un underscore isolé (pas partie d'un mot souligné __texte__)
      const prev = processed[i - 1] || ''
      const next = processed[i + 1] || ''
      if (prev !== '_' && next !== '_' && /[a-zA-Z0-9]/.test(prev) && /[a-zA-Z0-9]/.test(next)) {
        result += '\\_'
      } else {
        result += char
      }
    } else {
      result += char
    }
  }

  // 8. Corriger les flèches cassées
  processed = result
    .replace(/→/g, '\\rightarrow')
    .replace(/←/g, '\\leftarrow')
    .replace(/↔/g, '\\leftrightarrow')
    .replace(/⇒/g, '\\Rightarrow')
    .replace(/⇐/g, '\\Leftarrow')

  // 9. Nettoyer les lignes vides multiples (améliore le rendu)
  processed = processed.replace(/\n{3,}/g, '\n\n')

  return processed
}

/**
 * Fonction de fallback pour extraire le texte brut
 */
function extractPlainText(content) {
  if (!content || typeof content !== 'string') return ''

  return content
    // Supprimer les formules LaTeX
    .replace(/\$\$[^$]+\$\$/g, '[formule]')
    .replace(/\$[^$]+\$/g, '[formule]')
    // Supprimer le formatage Markdown
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    // Nettoyer
    .trim()
}

/**
 * RichText - Composant réutilisable pour le rendu Markdown + LaTeX
 * Avec gestion robuste des erreurs
 *
 * @param {string} children - Contenu Markdown à rendre
 * @param {string} className - Classes CSS additionnelles
 * @param {'inline' | 'block'} mode - Mode de rendu (inline = span, block = paragraphes)
 */
export default function RichText({
  children,
  className = "",
  mode = 'block'
}) {
  // Pré-traiter le contenu pour corriger les erreurs courantes
  const processedContent = useMemo(() => {
    return preprocessContent(children)
  }, [children])

  // Texte de fallback en cas d'erreur
  const fallbackText = useMemo(() => {
    return extractPlainText(children)
  }, [children])

  const components = {
    // Paragraphes - inline utilise span, block utilise p
    p: ({ node, children: pChildren, ...props }) =>
      mode === 'inline'
        ? <span className={className} {...props}>{pChildren}</span>
        : <p className="my-2 leading-relaxed" {...props}>{pChildren}</p>,

    // Headers
    h1: ({ node, ...props }) => (
      <h1 className="text-xl font-bold my-4 text-text-primary border-l-4 border-accent pl-3" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-lg font-bold my-3 text-text-primary" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-base font-semibold my-2 text-text-secondary" {...props} />
    ),

    // Text formatting
    strong: ({ node, ...props }) => (
      <strong className="font-bold text-accent" {...props} />
    ),
    em: ({ node, ...props }) => (
      <em className="italic text-text-secondary" {...props} />
    ),

    // Listes
    ul: ({ node, ...props }) => (
      <ul className="list-disc pl-4 space-y-1 my-2" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="marker:text-accent" {...props} />
    ),

    // Code (inline detection via className for react-markdown v9+)
    code: ({ node, className: codeClassName, children: codeChildren, ...props }) => {
      const isBlock = codeClassName?.includes('language-') || (node?.position?.start?.line !== node?.position?.end?.line)
      return isBlock
        ? <pre className="bg-surface-raised p-3 rounded-lg my-2 overflow-x-auto border border-white/10"><code className="text-sm" {...props}>{codeChildren}</code></pre>
        : <code className="bg-surface-raised px-1.5 py-0.5 rounded text-sm text-accent border border-white/10" {...props}>{codeChildren}</code>
    },

    // Tables
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-3 rounded-lg border border-white/20">
        <table className="min-w-full text-sm" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-surface-raised" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="px-3 py-2 text-left text-xs font-semibold text-accent uppercase" {...props} />
    ),
    tbody: ({ node, ...props }) => (
      <tbody className="divide-y divide-white/10" {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr className="hover:bg-surface-raised/50 transition-colors" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="px-3 py-2 text-text-primary" {...props} />
    ),

    // Blockquotes
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-2 border-accent/50 pl-3 my-2 italic text-text-secondary bg-accent/5 py-2 pr-3 rounded-r" {...props} />
    ),

    // Liens
    a: ({ node, ...props }) => (
      <a className="text-accent hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
    ),

    // Math display - avec gestion d'erreur
    div: ({ node, className: divClass, children: divChildren, ...props }) => {
      if (divClass === "math math-display") {
        return (
          <div className="my-3 flex justify-center overflow-x-auto" {...props}>
            <div className="px-4 py-3 bg-surface-raised border border-white/20 rounded-lg max-w-full">
              <RichTextErrorBoundary fallbackText="[Formule]">
                {divChildren}
              </RichTextErrorBoundary>
            </div>
          </div>
        )
      }
      return <div {...props}>{divChildren}</div>
    },

    // Math inline - avec gestion d'erreur
    span: ({ node, className: spanClass, children: spanChildren, ...props }) => {
      if (spanClass === "math math-inline") {
        return (
          <RichTextErrorBoundary fallbackText="[formule]">
            <span className="mx-1 text-accent" {...props}>{spanChildren}</span>
          </RichTextErrorBoundary>
        )
      }
      return <span {...props}>{spanChildren}</span>
    },

    // Image
    img: ({ node, src, alt, ...props }) => (
      <img
        src={src}
        alt={alt || 'Image'}
        className="max-w-full h-auto rounded-lg my-3 border border-white/20"
        loading="lazy"
        {...props}
      />
    ),

    // Horizontal rule
    hr: ({ node, ...props }) => (
      <hr className="my-4 border-white/20" {...props} />
    ),
  }

  // Configuration KaTeX avec options de tolérance aux erreurs
  const katexOptions = {
    throwOnError: false, // Ne pas throw sur les erreurs, afficher le texte brut
    errorColor: '#ff6b6b', // Couleur pour les erreurs
    strict: false, // Mode non-strict pour plus de tolérance
    trust: true, // Faire confiance aux commandes
    macros: {
      // Macros personnalisées pour les commandes courantes
      "\\R": "\\mathbb{R}",
      "\\N": "\\mathbb{N}",
      "\\Z": "\\mathbb{Z}",
      "\\Q": "\\mathbb{Q}",
      "\\C": "\\mathbb{C}",
    }
  }

  return (
    <RichTextErrorBoundary fallbackText={fallbackText}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, katexOptions]]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </RichTextErrorBoundary>
  )
}
