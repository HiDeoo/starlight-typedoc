export function addFrontmatter(content: string, frontmatter: Record<string, string>) {
  const entries = Object.entries(frontmatter).map(([key, value]) => `${key}: ${value}`)

  if (entries.length === 0) {
    return content
  }

  return `---\n${entries.join('\n')}\n---\n\n${content}`
}
