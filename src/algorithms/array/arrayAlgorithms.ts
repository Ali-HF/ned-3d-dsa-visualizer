import type { TraceEvent } from '../../types/trace';

export type ArrayOperationId =
  | 'bubble-sort'
  | 'selection-sort'
  | 'insertion-sort'
  | 'merge-sort'
  | 'quick-sort'
  | 'insert-at'
  | 'delete-at'
  | 'update-at'
  | 'linear-search'
  | 'binary-search'
  | 'reverse'
  | 'rotate';

export interface AlgorithmMetadata {
  id: ArrayOperationId;
  title: string;
  category: 'sorting' | 'operation';
  timeComplexity: string;
  spaceComplexity: string;
  code: string[];
}

export interface ArrayTraceResult {
  events: TraceEvent[];
  finalArray: number[];
  meta: AlgorithmMetadata;
}

export const ARRAY_ALGORITHM_METADATA: Record<ArrayOperationId, AlgorithmMetadata> = {
  'bubble-sort': {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    category: 'sorting',
    timeComplexity: 'O(n²) avg/worst, O(n) best',
    spaceComplexity: 'O(1) in-place',
    code: [
      'void bubbleSort(int arr[], int n) {',
      '  for (int i = 0; i < n - 1; i++) {',
      '    bool swapped = false;',
      '    for (int j = 0; j < n - i - 1; j++) {',
      '      if (arr[j] > arr[j + 1]) {',
      '        std::swap(arr[j], arr[j + 1]);',
      '        swapped = true;',
      '      }',
      '    }',
      '    if (!swapped) break;',
      '  }',
      '}',
    ],
  },
  'selection-sort': {
    id: 'selection-sort',
    title: 'Selection Sort',
    category: 'sorting',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1) in-place',
    code: [
      'void selectionSort(int arr[], int n) {',
      '  for (int i = 0; i < n - 1; i++) {',
      '    int minIdx = i;',
      '    for (int j = i + 1; j < n; j++) {',
      '      if (arr[j] < arr[minIdx]) minIdx = j;',
      '    }',
      '    if (minIdx != i) std::swap(arr[i], arr[minIdx]);',
      '  }',
      '}',
    ],
  },
  'insertion-sort': {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    category: 'sorting',
    timeComplexity: 'O(n²) avg/worst, O(n) best',
    spaceComplexity: 'O(1) in-place',
    code: [
      'void insertionSort(int arr[], int n) {',
      '  for (int i = 1; i < n; i++) {',
      '    int j = i;',
      '    while (j > 0 && arr[j - 1] > arr[j]) {',
      '      std::swap(arr[j - 1], arr[j]);',
      '      j--;',
      '    }',
      '  }',
      '}',
    ],
  },
  'merge-sort': {
    id: 'merge-sort',
    title: 'Merge Sort',
    category: 'sorting',
    timeComplexity: 'O(n log n) all cases',
    spaceComplexity: 'O(n) auxiliary array',
    code: [
      'void mergeSort(int arr[], int l, int r) {',
      '  if (l >= r) return;',
      '  int mid = l + (r - l) / 2;',
      '  mergeSort(arr, l, mid);',
      '  mergeSort(arr, mid + 1, r);',
      '  // Merge sorted halves [l..mid] and [mid+1..r] via aux[]',
      '  merge(arr, aux, l, mid, r);',
      '}',
    ],
  },
  'quick-sort': {
    id: 'quick-sort',
    title: 'Quick Sort',
    category: 'sorting',
    timeComplexity: 'O(n log n) avg, O(n²) worst',
    spaceComplexity: 'O(log n) recursion stack',
    code: [
      'int partition(int arr[], int low, int high) {',
      '  int pivot = arr[high], i = low - 1;',
      '  for (int j = low; j < high; j++) {',
      '    if (arr[j] <= pivot) {',
      '      i++; std::swap(arr[i], arr[j]);',
      '    }',
      '  }',
      '  std::swap(arr[i + 1], arr[high]);',
      '  return i + 1;',
      '}',
      'void quickSort(int arr[], int low, int high) {',
      '  if (low < high) {',
      '    int p = partition(arr, low, high);',
      '    quickSort(arr, low, p - 1);',
      '    quickSort(arr, p + 1, high);',
      '  }',
      '}',
    ],
  },
  'insert-at': {
    id: 'insert-at',
    title: 'Insert a Number',
    category: 'operation',
    timeComplexity: 'O(n) shift right',
    spaceComplexity: 'O(1)',
    code: [
      'void insertAt(int arr[], int& n, int idx, int val) {',
      '  for (int i = n; i > idx; i--) {',
      '    arr[i] = arr[i - 1];',
      '  }',
      '  arr[idx] = val;',
      '  n++;',
      '}',
    ],
  },
  'delete-at': {
    id: 'delete-at',
    title: 'Remove a Number',
    category: 'operation',
    timeComplexity: 'O(n) shift left',
    spaceComplexity: 'O(1)',
    code: [
      'void deleteAt(int arr[], int& n, int idx) {',
      '  for (int i = idx; i < n - 1; i++) {',
      '    arr[i] = arr[i + 1];',
      '  }',
      '  n--;',
      '}',
    ],
  },
  'update-at': {
    id: 'update-at',
    title: 'Change a Number',
    category: 'operation',
    timeComplexity: 'O(1) direct index',
    spaceComplexity: 'O(1)',
    code: [
      'void updateAt(int arr[], int idx, int newVal) {',
      '  arr[idx] = newVal;',
      '}',
    ],
  },
  'linear-search': {
    id: 'linear-search',
    title: 'Linear Search',
    category: 'operation',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: [
      'int linearSearch(int arr[], int n, int target) {',
      '  for (int i = 0; i < n; i++) {',
      '    if (arr[i] == target) return i;',
      '  }',
      '  return -1;',
      '}',
    ],
  },
  'binary-search': {
    id: 'binary-search',
    title: 'Binary Search',
    category: 'operation',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    code: [
      'int binarySearch(int arr[], int n, int target) {',
      '  int low = 0, high = n - 1;',
      '  while (low <= high) {',
      '    int mid = low + (high - low) / 2;',
      '    if (arr[mid] == target) return mid;',
      '    if (arr[mid] < target) low = mid + 1;',
      '    else high = mid - 1;',
      '  }',
      '  return -1;',
      '}',
    ],
  },
  reverse: {
    id: 'reverse',
    title: 'Reverse Order',
    category: 'operation',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) in-place',
    code: [
      'void reverseArray(int arr[], int n) {',
      '  int left = 0, right = n - 1;',
      '  while (left < right) {',
      '    std::swap(arr[left], arr[right]);',
      '    left++; right--;',
      '  }',
      '}',
    ],
  },
  rotate: {
    id: 'rotate',
    title: 'Shift Left',
    category: 'operation',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: [
      'void rotateLeftByOne(int arr[], int n) {',
      '  int first = arr[0];',
      '  for (int i = 0; i < n - 1; i++) {',
      '    arr[i] = arr[i + 1];',
      '  }',
      '  arr[n - 1] = first;',
      '}',
    ],
  },
};

function emitArrayInit(events: TraceEvent[], id: string, values: number[], noteText?: string) {
  events.push({ t: 'create', id, kind: 'array', value: values.length });
  for (let i = 0; i < values.length; i++) {
    events.push({ t: 'set', target: { id, index: i }, value: values[i] });
  }
  if (noteText) {
    events.push({ t: 'note', text: noteText });
  }
}

const ACTION_EVENT_TYPES = new Set(['compare', 'swap', 'set', 'visit', 'remove']);

/**
 * Ensures that each step's `{ t: 'note' }` is emitted immediately AFTER its
 * associated action events (`compare`, `swap`, `set`, `visit`, `remove`), and
 * that `swap` / `compare` is the final action before `note` so `traceEngine`
 * preserves `swappedRefs` and `comparedRefs` when the player stops at `note`.
 */
function syncNotesAfterActions(events: TraceEvent[]): TraceEvent[] {
  const out = [...events];
  let i = 0;
  while (i < out.length) {
    if (out[i].t === 'note') {
      let end = i + 1;
      while (end < out.length && ACTION_EVENT_TYPES.has(out[end].t)) {
        end++;
      }
      if (end > i + 1) {
        const noteEvent = out[i];
        const actions = out.slice(i + 1, end);
        // Keep non-highlight actions (like visit/set) before compare/swap so
        // traceEngine doesn't clear comparedRefs or swappedRefs before the note.
        const regularActions = actions.filter(
          (a) => a.t !== 'swap' && a.t !== 'compare',
        );
        const highlightActions = actions.filter(
          (a) => a.t === 'swap' || a.t === 'compare',
        );
        const reordered = [...regularActions, ...highlightActions, noteEvent];
        out.splice(i, end - i, ...reordered);
        i = end;
        continue;
      }
    }
    i++;
  }
  return out;
}

export function bubbleSortTrace(
  input: number[],
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];
  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Ready to sort ${arr.length} numbers with Bubble Sort: ${arr.join(', ')}.`,
    );
  }

  const n = arr.length;
  const totalPasses = Math.max(1, n - 1);

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    events.push({ t: 'line', line: 2 });
    events.push({
      t: 'note',
      text: `Starting pass ${i + 1} of ${totalPasses} to move the largest remaining number to the right.`,
    });

    for (let j = 0; j < n - i - 1; j++) {
      const leftVal = arr[j];
      const rightVal = arr[j + 1];
      events.push({ t: 'line', line: 5 });
      events.push({
        t: 'note',
        text:
          leftVal > rightVal
            ? `Comparing ${leftVal} and ${rightVal}. ${leftVal} is bigger, so they swap places.`
            : `Comparing ${leftVal} and ${rightVal}. ${leftVal} is already smaller or equal, so they stay put.`,
      });
      events.push({
        t: 'compare',
        a: { id: 'arr', index: j },
        b: { id: 'arr', index: j + 1 },
      });

      if (leftVal > rightVal) {
        arr[j] = rightVal;
        arr[j + 1] = leftVal;
        swapped = true;
        events.push({ t: 'line', line: 6 });
        events.push({
          t: 'note',
          text: `Swapping ${leftVal} and ${rightVal} so ${rightVal} moves to position ${j + 1} and ${leftVal} moves to position ${j + 2}.`,
        });
        events.push({
          t: 'swap',
          a: { id: 'arr', index: j },
          b: { id: 'arr', index: j + 1 },
        });
      }
    }

    const settledIdx = n - 1 - i;
    events.push({
      t: 'note',
      text: `Pass ${i + 1} of ${totalPasses} is done. ${arr[settledIdx]} is now in its final place at position ${settledIdx + 1}.`,
    });
    events.push({ t: 'visit', id: `arr[${settledIdx}]` });

    if (!swapped) {
      events.push({ t: 'line', line: 10 });
      events.push({
        t: 'note',
        text: 'No swaps were needed on this pass, so all remaining numbers are already in order.',
      });
      break;
    }
  }

  for (let i = 0; i < n; i++) {
    events.push({
      t: 'note',
      text: `Confirming ${arr[i]} is in its final sorted spot at position ${i + 1}.`,
    });
    events.push({ t: 'visit', id: `arr[${i}]` });
  }
  events.push({
    t: 'note',
    text: `Sorting complete! The numbers in order are ${arr.join(', ')}.`,
  });
  events.push({ t: 'done' });

  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['bubble-sort'],
  };
}

export function selectionSortTrace(
  input: number[],
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];
  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Ready to sort ${arr.length} numbers with Selection Sort: ${arr.join(', ')}.`,
    );
  }

  const n = arr.length;
  const totalPasses = Math.max(1, n - 1);

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    events.push({ t: 'line', line: 3 });
    events.push({
      t: 'note',
      text: `Pass ${i + 1} of ${totalPasses}: starting with ${arr[i]} at position ${i + 1} as the smallest number seen so far.`,
    });

    for (let j = i + 1; j < n; j++) {
      events.push({ t: 'line', line: 5 });
      const candidate = arr[j];
      const currentMin = arr[minIdx];
      if (candidate < currentMin) {
        minIdx = j;
        events.push({
          t: 'note',
          text: `Comparing ${candidate} with current smallest ${currentMin}. ${candidate} is smaller, so ${candidate} becomes the new smallest.`,
        });
      } else {
        events.push({
          t: 'note',
          text: `Comparing ${candidate} with current smallest ${currentMin}. ${currentMin} is still smaller.`,
        });
      }
      events.push({
        t: 'compare',
        a: { id: 'arr', index: j },
        b: { id: 'arr', index: minIdx },
      });
    }

    if (minIdx !== i) {
      const firstVal = arr[i];
      const smallestVal = arr[minIdx];
      arr[i] = smallestVal;
      arr[minIdx] = firstVal;
      events.push({ t: 'line', line: 7 });
      events.push({
        t: 'note',
        text: `Swapping ${smallestVal} into position ${i + 1} and moving ${firstVal} to position ${minIdx + 1}.`,
      });
      events.push({
        t: 'swap',
        a: { id: 'arr', index: i },
        b: { id: 'arr', index: minIdx },
      });
    }
    events.push({
      t: 'note',
      text: `Pass ${i + 1} of ${totalPasses} is done. ${arr[i]} is now locked in its final place at position ${i + 1}.`,
    });
    events.push({ t: 'visit', id: `arr[${i}]` });
  }
  if (n > 0) {
    events.push({
      t: 'note',
      text: `${arr[n - 1]} at position ${n} is now in its final place.`,
    });
    events.push({ t: 'visit', id: `arr[${n - 1}]` });
  }
  events.push({
    t: 'note',
    text: `Sorting complete! The numbers in order are ${arr.join(', ')}.`,
  });
  events.push({ t: 'done' });

  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['selection-sort'],
  };
}

export function insertionSortTrace(
  input: number[],
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];
  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Ready to sort ${arr.length} numbers with Insertion Sort: ${arr.join(', ')}.`,
    );
  }

  const n = arr.length;
  if (n > 0) {
    events.push({
      t: 'note',
      text: `Starting with the first number, ${arr[0]}, as our sorted group on the left.`,
    });
    events.push({ t: 'visit', id: 'arr[0]' });
  }

  for (let i = 1; i < n; i++) {
    let j = i;
    events.push({ t: 'line', line: 2 });
    events.push({
      t: 'note',
      text: `Picking up ${arr[i]} from position ${i + 1} to slide it into its proper place on the left.`,
    });

    while (j > 0) {
      const leftVal = arr[j - 1];
      const currVal = arr[j];
      events.push({ t: 'line', line: 4 });
      events.push({
        t: 'note',
        text:
          leftVal > currVal
            ? `Comparing ${leftVal} and ${currVal}. ${leftVal} is bigger, so they swap places.`
            : `Comparing ${leftVal} and ${currVal}. ${leftVal} is smaller or equal, so ${currVal} stops here.`,
      });
      events.push({
        t: 'compare',
        a: { id: 'arr', index: j - 1 },
        b: { id: 'arr', index: j },
      });

      if (leftVal > currVal) {
        arr[j - 1] = currVal;
        arr[j] = leftVal;
        events.push({ t: 'line', line: 5 });
        events.push({
          t: 'note',
          text: `Swapping ${leftVal} and ${currVal} so ${currVal} moves left to position ${j}.`,
        });
        events.push({
          t: 'swap',
          a: { id: 'arr', index: j - 1 },
          b: { id: 'arr', index: j },
        });
        j--;
      } else {
        break;
      }
    }
    events.push({
      t: 'note',
      text: `The first ${i + 1} numbers (${arr.slice(0, i + 1).join(', ')}) are now in order.`,
    });
    events.push({ t: 'visit', id: `arr[${i}]` });
  }

  events.push({
    t: 'note',
    text: `Sorting complete! The numbers in order are ${arr.join(', ')}.`,
  });
  events.push({ t: 'done' });

  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['insertion-sort'],
  };
}

export function mergeSortTrace(
  input: number[],
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];
  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Ready to sort ${arr.length} numbers with Merge Sort: ${arr.join(', ')}.`,
    );
  }

  const n = arr.length;
  events.push({ t: 'create', id: 'aux', kind: 'array', value: n });
  for (let i = 0; i < n; i++) {
    events.push({ t: 'set', target: { id: 'aux', index: i }, value: arr[i] });
  }

  function sort(l: number, r: number, depth: number) {
    events.push({ t: 'call', fn: 'mergeSort', args: [l, r], depth });
    events.push({ t: 'line', line: 2 });
    if (l >= r) {
      events.push({ t: 'return', fn: 'mergeSort' });
      return;
    }

    const mid = Math.floor(l + (r - l) / 2);
    events.push({ t: 'line', line: 3 });
    events.push({
      t: 'note',
      text: `Splitting positions ${l + 1} to ${r + 1} into two halves at position ${mid + 1}.`,
    });

    events.push({ t: 'line', line: 4 });
    sort(l, mid, depth + 1);

    events.push({ t: 'line', line: 5 });
    sort(mid + 1, r, depth + 1);

    events.push({ t: 'line', line: 7 });
    events.push({
      t: 'note',
      text: `Merging the two sorted halves back together into positions ${l + 1} to ${r + 1}.`,
    });

    const auxSlice: number[] = [];
    for (let k = l; k <= r; k++) {
      auxSlice[k] = arr[k];
      events.push({
        t: 'note',
        text: `Copying ${arr[k]} into the helper row at position ${k + 1}.`,
      });
      events.push({ t: 'set', target: { id: 'aux', index: k }, value: arr[k] });
    }

    let i = l;
    let j = mid + 1;
    for (let k = l; k <= r; k++) {
      if (i > mid) {
        arr[k] = auxSlice[j];
        events.push({
          t: 'note',
          text: `Placing remaining number ${auxSlice[j]} from the right half into position ${k + 1}.`,
        });
        events.push({ t: 'set', target: { id: 'arr', index: k }, value: auxSlice[j] });
        j++;
      } else if (j > r) {
        arr[k] = auxSlice[i];
        events.push({
          t: 'note',
          text: `Placing remaining number ${auxSlice[i]} from the left half into position ${k + 1}.`,
        });
        events.push({ t: 'set', target: { id: 'arr', index: k }, value: auxSlice[i] });
        i++;
      } else {
        events.push({
          t: 'note',
          text:
            auxSlice[i] <= auxSlice[j]
              ? `Comparing ${auxSlice[i]} and ${auxSlice[j]}. ${auxSlice[i]} is smaller or equal, so it goes next.`
              : `Comparing ${auxSlice[i]} and ${auxSlice[j]}. ${auxSlice[j]} is smaller, so it goes next.`,
        });
        events.push({
          t: 'compare',
          a: { id: 'aux', index: i },
          b: { id: 'aux', index: j },
        });
        if (auxSlice[i] <= auxSlice[j]) {
          arr[k] = auxSlice[i];
          events.push({
            t: 'note',
            text: `Writing ${auxSlice[i]} into position ${k + 1}.`,
          });
          events.push({ t: 'set', target: { id: 'arr', index: k }, value: auxSlice[i] });
          i++;
        } else {
          arr[k] = auxSlice[j];
          events.push({
            t: 'note',
            text: `Writing ${auxSlice[j]} into position ${k + 1}.`,
          });
          events.push({ t: 'set', target: { id: 'arr', index: k }, value: auxSlice[j] });
          j++;
        }
      }
      events.push({ t: 'visit', id: `arr[${k}]` });
    }

    events.push({ t: 'return', fn: 'mergeSort' });
  }

  if (n > 0) {
    sort(0, n - 1, 0);
  }
  events.push({ t: 'remove', id: 'aux' });
  events.push({
    t: 'note',
    text: `Sorting complete! The numbers in order are ${arr.join(', ')}.`,
  });
  events.push({ t: 'done' });

  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['merge-sort'],
  };
}

export function quickSortTrace(
  input: number[],
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];
  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Ready to sort ${arr.length} numbers with Quick Sort: ${arr.join(', ')}.`,
    );
  }

  function partition(low: number, high: number, depth: number): number {
    events.push({ t: 'call', fn: 'partition', args: [low, high], depth });
    const pivot = arr[high];
    let i = low - 1;
    events.push({ t: 'line', line: 2 });
    events.push({
      t: 'note',
      text: `Choosing ${pivot} (at position ${high + 1}) as the pivot to split smaller and larger numbers.`,
    });

    for (let j = low; j < high; j++) {
      const currentVal = arr[j];
      events.push({ t: 'line', line: 4 });
      events.push({
        t: 'note',
        text:
          currentVal <= pivot
            ? `Comparing ${currentVal} with pivot ${pivot}. ${currentVal} is smaller or equal, so it moves to the left side.`
            : `Comparing ${currentVal} with pivot ${pivot}. ${currentVal} is bigger, so it stays on the right side.`,
      });
      events.push({
        t: 'compare',
        a: { id: 'arr', index: j },
        b: { id: 'arr', index: high },
      });
      if (currentVal <= pivot) {
        i++;
        if (i !== j) {
          const leftVal = arr[i];
          const rightVal = arr[j];
          arr[i] = rightVal;
          arr[j] = leftVal;
          events.push({ t: 'line', line: 5 });
          events.push({
            t: 'note',
            text: `Swapping ${leftVal} and ${rightVal} so ${rightVal} joins the smaller numbers on the left.`,
          });
          events.push({
            t: 'swap',
            a: { id: 'arr', index: i },
            b: { id: 'arr', index: j },
          });
        }
      }
    }

    const pivotFinal = i + 1;
    if (pivotFinal !== high) {
      const displaced = arr[pivotFinal];
      arr[pivotFinal] = arr[high];
      arr[high] = displaced;
      events.push({ t: 'line', line: 8 });
      events.push({
        t: 'note',
        text: `Swapping pivot ${pivot} with ${displaced} so ${pivot} lands in its final place at position ${pivotFinal + 1}.`,
      });
      events.push({
        t: 'swap',
        a: { id: 'arr', index: pivotFinal },
        b: { id: 'arr', index: high },
      });
    }
    events.push({
      t: 'note',
      text: `${pivot} is now locked in its final place at position ${pivotFinal + 1}.`,
    });
    events.push({ t: 'visit', id: `arr[${pivotFinal}]` });
    events.push({ t: 'return', fn: 'partition', value: pivotFinal });
    return pivotFinal;
  }

  function sort(low: number, high: number, depth: number) {
    events.push({ t: 'call', fn: 'quickSort', args: [low, high], depth });
    events.push({ t: 'line', line: 12 });
    if (low < high) {
      const p = partition(low, high, depth + 1);
      events.push({ t: 'line', line: 14 });
      sort(low, p - 1, depth + 1);
      events.push({ t: 'line', line: 15 });
      sort(p + 1, high, depth + 1);
    } else if (low === high && low >= 0 && low < arr.length) {
      events.push({
        t: 'note',
        text: `${arr[low]} is a single number at position ${low + 1}, so it is already in its final place.`,
      });
      events.push({ t: 'visit', id: `arr[${low}]` });
    }
    events.push({ t: 'return', fn: 'quickSort' });
  }

  if (arr.length > 0) {
    sort(0, arr.length - 1, 0);
  }
  events.push({
    t: 'note',
    text: `Sorting complete! The numbers in order are ${arr.join(', ')}.`,
  });
  events.push({ t: 'done' });

  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['quick-sort'],
  };
}

export function arrayInsertAtTrace(
  input: number[],
  rawIndex: number,
  value: number,
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const index = Math.max(0, Math.min(arr.length, Math.floor(rawIndex)));
  const events: TraceEvent[] = [];

  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Preparing to insert ${value} at position ${index + 1}.`,
    );
  }

  const oldLen = arr.length;
  arr.push(0);
  events.push({ t: 'line', line: 2 });
  events.push({
    t: 'note',
    text: `Adding a new empty slot at the end (position ${oldLen + 1}) so numbers can shift right.`,
  });
  events.push({ t: 'set', target: { id: 'arr', index: oldLen }, value: 0 });

  for (let i = oldLen; i > index; i--) {
    arr[i] = arr[i - 1];
    events.push({ t: 'line', line: 3 });
    events.push({
      t: 'note',
      text: `Moving ${arr[i]} one step right from position ${i} to position ${i + 1}.`,
    });
    events.push({ t: 'set', target: { id: 'arr', index: i }, value: arr[i] });
  }

  arr[index] = value;
  events.push({ t: 'line', line: 5 });
  events.push({
    t: 'note',
    text: `Placed ${value} into position ${index + 1}.`,
  });
  events.push({ t: 'set', target: { id: 'arr', index }, value });
  events.push({ t: 'visit', id: `arr[${index}]` });
  events.push({ t: 'done' });

  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['insert-at'],
  };
}

export function arrayDeleteAtTrace(
  input: number[],
  rawIndex: number,
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];

  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Preparing to remove the number at position ${rawIndex + 1}.`,
    );
  }

  if (arr.length === 0) {
    events.push({ t: 'note', text: 'The list is already empty, so there is nothing to remove.' });
    events.push({ t: 'done' });
    return { events, finalArray: arr, meta: ARRAY_ALGORITHM_METADATA['delete-at'] };
  }

  const index = Math.max(0, Math.min(arr.length - 1, Math.floor(rawIndex)));
  const removedVal = arr[index];
  events.push({ t: 'line', line: 2 });
  events.push({
    t: 'note',
    text: `Selecting ${removedVal} at position ${index + 1} for removal.`,
  });
  events.push({ t: 'visit', id: `arr[${index}]` });

  for (let i = index; i < arr.length - 1; i++) {
    arr[i] = arr[i + 1];
    events.push({ t: 'line', line: 3 });
    events.push({
      t: 'note',
      text: `Moving ${arr[i]} one step left into position ${i + 1} to fill the gap.`,
    });
    events.push({ t: 'set', target: { id: 'arr', index: i }, value: arr[i] });
  }

  const lastIdx = arr.length - 1;
  arr.pop();
  events.push({ t: 'line', line: 5 });
  events.push({
    t: 'note',
    text: `Removed ${removedVal}. There are now ${arr.length} numbers left.`,
  });
  events.push({ t: 'remove', id: `arr[${lastIdx}]` });
  events.push({ t: 'done' });

  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['delete-at'],
  };
}

export function arrayUpdateAtTrace(
  input: number[],
  rawIndex: number,
  newValue: number,
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];

  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Preparing to change the number at position ${rawIndex + 1} to ${newValue}.`,
    );
  }

  if (arr.length === 0) {
    events.push({ t: 'note', text: 'The list is empty.' });
    events.push({ t: 'done' });
    return { events, finalArray: arr, meta: ARRAY_ALGORITHM_METADATA['update-at'] };
  }

  const index = Math.max(0, Math.min(arr.length - 1, Math.floor(rawIndex)));
  const oldVal = arr[index];
  arr[index] = newValue;
  events.push({ t: 'line', line: 2 });
  events.push({
    t: 'note',
    text: `Changed position ${index + 1} from ${oldVal} to ${newValue}.`,
  });
  events.push({ t: 'set', target: { id: 'arr', index }, value: newValue });
  events.push({ t: 'visit', id: `arr[${index}]` });
  events.push({ t: 'done' });

  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['update-at'],
  };
}

export function arrayLinearSearchTrace(
  input: number[],
  target: number,
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];

  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Searching for ${target} one by one from left to right.`,
    );
  }

  for (let i = 0; i < arr.length; i++) {
    events.push({ t: 'line', line: 2 });
    events.push({
      t: 'note',
      text: `Checking position ${i + 1}: the number here is ${arr[i]}.`,
    });
    events.push({ t: 'visit', id: `arr[${i}]` });
    events.push({
      t: 'compare',
      a: { id: 'arr', index: i },
      b: { id: 'arr', index: i },
    });
    if (arr[i] === target) {
      events.push({ t: 'line', line: 3 });
      events.push({
        t: 'note',
        text: `Found ${target} at position ${i + 1} (Found target ${target} at index ${i})!`,
      });
      events.push({ t: 'done' });
      return {
        events: syncNotesAfterActions(events),
        finalArray: arr,
        meta: ARRAY_ALGORITHM_METADATA['linear-search'],
      };
    }
    events.push({
      t: 'note',
      text: `${arr[i]} is not ${target}, so we move to position ${i + 2}.`,
    });
  }

  events.push({ t: 'line', line: 5 });
  events.push({
    t: 'note',
    text: `Checked every number, and ${target} was not found.`,
  });
  events.push({ t: 'done' });
  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['linear-search'],
  };
}

export function arrayBinarySearchTrace(
  input: number[],
  target: number,
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input].sort((a, b) => a - b);
  const events: TraceEvent[] = [];

  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Searching for ${target} using Binary Search on sorted numbers: ${arr.join(', ')}.`,
    );
  } else {
    for (let i = 0; i < arr.length; i++) {
      events.push({ t: 'set', target: { id: 'arr', index: i }, value: arr[i] });
    }
  }

  let low = 0;
  let high = arr.length - 1;
  events.push({ t: 'line', line: 2 });

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    events.push({ t: 'line', line: 4 });
    events.push({
      t: 'note',
      text: `Checking the middle of positions ${low + 1} to ${high + 1}: position ${mid + 1} has ${arr[mid]}.`,
    });
    events.push({ t: 'visit', id: `arr[${mid}]` });
    events.push({
      t: 'compare',
      a: { id: 'arr', index: low },
      b: { id: 'arr', index: high },
    });

    if (arr[mid] === target) {
      events.push({ t: 'line', line: 5 });
      events.push({
        t: 'note',
        text: `Found ${target} at position ${mid + 1} (Target found at index ${mid})!`,
      });
      events.push({ t: 'done' });
      return {
        events: syncNotesAfterActions(events),
        finalArray: arr,
        meta: ARRAY_ALGORITHM_METADATA['binary-search'],
      };
    }

    if (arr[mid] < target) {
      events.push({ t: 'line', line: 6 });
      events.push({
        t: 'note',
        text: `${arr[mid]} is smaller than ${target}, so we narrow our search to the right half (positions ${mid + 2} to ${high + 1}).`,
      });
      low = mid + 1;
    } else {
      events.push({ t: 'line', line: 7 });
      events.push({
        t: 'note',
        text: `${arr[mid]} is bigger than ${target}, so we narrow our search to the left half (positions ${low + 1} to ${mid}).`,
      });
      high = mid - 1;
    }
  }

  events.push({ t: 'line', line: 9 });
  events.push({
    t: 'note',
    text: `Search finished: ${target} is not in the list.`,
  });
  events.push({ t: 'done' });
  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['binary-search'],
  };
}

export function arrayReverseTrace(
  input: number[],
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];

  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Reversing the order of ${arr.length} numbers by swapping ends toward the middle.`,
    );
  }

  let left = 0;
  let right = arr.length - 1;
  events.push({ t: 'line', line: 2 });

  while (left < right) {
    const leftVal = arr[left];
    const rightVal = arr[right];
    events.push({ t: 'line', line: 4 });
    events.push({
      t: 'note',
      text: `Comparing outer positions ${left + 1} (${leftVal}) and ${right + 1} (${rightVal}) before swapping them.`,
    });
    events.push({
      t: 'compare',
      a: { id: 'arr', index: left },
      b: { id: 'arr', index: right },
    });

    arr[left] = rightVal;
    arr[right] = leftVal;
    events.push({
      t: 'note',
      text: `Swapping ${leftVal} and ${rightVal} between positions ${left + 1} and ${right + 1}.`,
    });
    events.push({
      t: 'swap',
      a: { id: 'arr', index: left },
      b: { id: 'arr', index: right },
    });
    events.push({ t: 'visit', id: `arr[${left}]` });
    events.push({ t: 'visit', id: `arr[${right}]` });
    left++;
    right--;
  }

  events.push({
    t: 'note',
    text: `Reverse complete! The new order is ${arr.join(', ')}.`,
  });
  events.push({ t: 'done' });
  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['reverse'],
  };
}

export function arrayRotateTrace(
  input: number[],
  steps: number = 1,
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];

  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Shifting all numbers left by ${steps} step(s), wrapping the front around to the end.`,
    );
  }

  const n = arr.length;
  if (n <= 1) {
    events.push({ t: 'done' });
    return { events, finalArray: arr, meta: ARRAY_ALGORITHM_METADATA['rotate'] };
  }

  const k = ((Math.floor(steps) % n) + n) % n;
  for (let rot = 0; rot < k; rot++) {
    const first = arr[0];
    events.push({ t: 'line', line: 2 });
    events.push({
      t: 'note',
      text: `Shift ${rot + 1} of ${k}: saving the first number (${first}) so it can wrap around to the end.`,
    });
    for (let i = 0; i < n - 1; i++) {
      arr[i] = arr[i + 1];
      events.push({ t: 'line', line: 4 });
      events.push({
        t: 'note',
        text: `Moving ${arr[i]} one step left into position ${i + 1}.`,
      });
      events.push({ t: 'set', target: { id: 'arr', index: i }, value: arr[i] });
    }
    arr[n - 1] = first;
    events.push({ t: 'line', line: 6 });
    events.push({
      t: 'note',
      text: `Placing ${first} at the end (position ${n}).`,
    });
    events.push({ t: 'set', target: { id: 'arr', index: n - 1 }, value: first });
    events.push({ t: 'visit', id: `arr[${n - 1}]` });
  }

  events.push({
    t: 'note',
    text: `Shift complete! The new order is ${arr.join(', ')}.`,
  });
  events.push({ t: 'done' });
  return {
    events: syncNotesAfterActions(events),
    finalArray: arr,
    meta: ARRAY_ALGORITHM_METADATA['rotate'],
  };
}

export function runArrayOperation(
  op: ArrayOperationId,
  input: number[],
  paramIndex: number = 0,
  paramValue: number = 42,
  emitInit: boolean = true,
): ArrayTraceResult {
  switch (op) {
    case 'bubble-sort':
      return bubbleSortTrace(input, emitInit);
    case 'selection-sort':
      return selectionSortTrace(input, emitInit);
    case 'insertion-sort':
      return insertionSortTrace(input, emitInit);
    case 'merge-sort':
      return mergeSortTrace(input, emitInit);
    case 'quick-sort':
      return quickSortTrace(input, emitInit);
    case 'insert-at':
      return arrayInsertAtTrace(input, paramIndex, paramValue, emitInit);
    case 'delete-at':
      return arrayDeleteAtTrace(input, paramIndex, emitInit);
    case 'update-at':
      return arrayUpdateAtTrace(input, paramIndex, paramValue, emitInit);
    case 'linear-search':
      return arrayLinearSearchTrace(input, paramValue, emitInit);
    case 'binary-search':
      return arrayBinarySearchTrace(input, paramValue, emitInit);
    case 'reverse':
      return arrayReverseTrace(input, emitInit);
    case 'rotate':
      return arrayRotateTrace(input, paramIndex || 1, emitInit);
  }
}
