export function assertSameUnit(sourceUnit: string, targetUnit: string) {
  if (sourceUnit !== targetUnit) {
    throw new Error(`Unit mismatch: expected ${sourceUnit}, received ${targetUnit}`);
  }
}
