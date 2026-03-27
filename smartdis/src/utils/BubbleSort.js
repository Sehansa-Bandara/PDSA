/**
 * BubbleSort.js
 * -------------
 * Sorts an array of products by price ascending (low → high)
 * using the classic Bubble Sort algorithm.
 *
 * Algorithm:
 *   - Repeatedly steps through the list
 *   - Compares each pair of adjacent items
 *   - Swaps them if they are in the wrong order
 *   - Repeats until no swaps are needed (sorted)
 *
 * Time Complexity:  O(n²) worst/average case
 *                   O(n)  best case (already sorted — early exit)
 * Space Complexity: O(n)  — works on a copy, original is not mutated
 */
export function bubbleSortByPrice(arr) {
  const a = [...arr]; // copy — never mutate the original heap array
  const n = a.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    // After each pass, the largest unsorted element bubbles to the end
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j].price > a[j + 1].price) {
        // Swap adjacent elements
        const tmp  = a[j];
        a[j]       = a[j + 1];
        a[j + 1]   = tmp;
        swapped    = true;
      }
    }

    // Early exit — if no swap happened the array is already sorted
    if (!swapped) break;
  }

  return a;
}
