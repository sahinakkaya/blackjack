import { TBet } from '../types.ds';

export function getChips(value: number): TBet[] | null {
  const chips: TBet[] = [100, 60, 40, 20, 10, 5, 2];

  function findCombination(remainingValue: number, currentResult: TBet[], index: number): TBet[] | null {
    if (remainingValue === 0) {
      return currentResult;
    }
    if (remainingValue < 0 || index >= chips.length) {
      return null;
    }

    const chip = chips[index];
    const maxCount = Math.floor(remainingValue / chip);

    for (let count = maxCount; count >= 0; count--) {
      const newResult = [...currentResult, ...Array(count).fill(chip)];
      const result = findCombination(remainingValue - count * chip, newResult, index + 1);
      if (result) {
        return result;
      }
    }

    return null; // No valid combination found
  }

  return findCombination(value, [], 0);
}

