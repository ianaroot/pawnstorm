export function exampleId(example) {
  return example.id ?? `${example.priorBoard?.layOut?.join('') ?? ''}|${example.moveObject?.startPosition ?? ''}-${example.moveObject?.endPosition ?? ''}`
}
