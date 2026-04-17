const PREFIXES = ['gameplay/', 'bot_execution/', 'editorV2/']

export async function resolve(specifier, context, nextResolve) {
  for (const prefix of PREFIXES) {
    if (!specifier.startsWith(prefix)) { continue }

    return {
      url: new URL(`./${specifier}.js`, new URL('./', import.meta.url)).href,
      shortCircuit: true
    }
  }

  return nextResolve(specifier, context)
}
