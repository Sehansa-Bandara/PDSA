
export function bubbleSortByPrice(arr) {
  const a = [...arr]; 
  const n = a.length;


  for (let i = 0; i < n - 1; i++) { // Bubble sort needs multiple passes through the array.
    let swapped = false; 

    
    for (let j = 0; j < n - 1 - i; j++) { 
      if (a[j].price > a[j + 1].price) { //compare the price of adjacent elements
        // Swap adjacent elements
        const tmp  = a[j];
        a[j]       = a[j + 1];
        a[j + 1]   = tmp;
        swapped    = true;
      }
    }

    
    if (!swapped) break;
  }

  return a;
}


export function bubbleSortByPriceDesc(arr) {
  const a = [...arr]; 
  const n = a.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    // After each pass, the smallest unsorted element bubbles to the end
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j].price < a[j + 1].price) {
        // Swap adjacent elements
        const tmp  = a[j];
        a[j]       = a[j + 1];
        a[j + 1]   = tmp;
        swapped    = true;
      }
    }

    // If no swap happened, the array is already sorted
    if (!swapped) break;
  }

  return a;
}
