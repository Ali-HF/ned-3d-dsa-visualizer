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
    title: 'Quick Sort (Lomuto Partition)',
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
    title: 'Array Insert at Index',
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
    title: 'Array Delete at Index',
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
    title: 'Array Update at Index',
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
    title: 'Reverse Array (Two Pointers)',
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
    title: 'Rotate Array Left by k',
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

export function bubbleSortTrace(
  input: number[],
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];
  if (emitInit) {
    emitArrayInit(events, 'arr', arr, `Initialized array of ${arr.length} elements for Bubble Sort`);
  }

  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    events.push({ t: 'line', line: 2 });
    events.push({ t: 'note', text: `Pass ${i + 1}: bubbling largest unsorted value toward index ${n - 1 - i}` });

    for (let j = 0; j < n - i - 1; j++) {
      events.push({ t: 'line', line: 5 });
      events.push({
        t: 'compare',
        a: { id: 'arr', index: j },
        b: { id: 'arr', index: j + 1 },
      });
      events.push({
        t: 'note',
        text: `Compare arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]}): ${
          arr[j] > arr[j + 1] ? `${arr[j]} > ${arr[j + 1]} → swap` : `${arr[j]} ≤ ${arr[j + 1]} → keep order`
        }`,
      });

      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
        swapped = true;
        events.push({ t: 'line', line: 6 });
        events.push({
          t: 'swap',
          a: { id: 'arr', index: j },
          b: { id: 'arr', index: j + 1 },
        });
        events.push({
          t: 'note',
          text: `Swapped arr[${j}] and arr[${j + 1}] (${arr[j]} ⇄ ${arr[j + 1]})`,
        });
      }
    }
    events.push({ t: 'visit', id: `arr[${n - 1 - i}]` });
    if (!swapped) {
      events.push({ t: 'line', line: 10 });
      events.push({ t: 'note', text: 'No swaps in this pass — array is already sorted!' });
      break;
    }
  }

  for (let i = 0; i < n; i++) {
    events.push({ t: 'visit', id: `arr[${i}]` });
  }
  events.push({ t: 'note', text: `Bubble Sort complete: [${arr.join(', ')}]` });
  events.push({ t: 'done' });

  return {
    events,
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
    emitArrayInit(events, 'arr', arr, `Initialized array of ${arr.length} elements for Selection Sort`);
  }

  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    events.push({ t: 'line', line: 3 });
    events.push({ t: 'note', text: `Pass ${i + 1}: assume minimum is arr[${i}] = ${arr[i]}` });

    for (let j = i + 1; j < n; j++) {
      events.push({ t: 'line', line: 5 });
      events.push({
        t: 'compare',
        a: { id: 'arr', index: j },
        b: { id: 'arr', index: minIdx },
      });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        events.push({
          t: 'note',
          text: `New minimum found: arr[${j}] = ${arr[j]}`,
        });
      } else {
        events.push({
          t: 'note',
          text: `arr[${j}] (${arr[j]}) ≥ current min arr[${minIdx}] (${arr[minIdx]})`,
        });
      }
    }

    if (minIdx !== i) {
      const tmp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = tmp;
      events.push({ t: 'line', line: 7 });
      events.push({
        t: 'swap',
        a: { id: 'arr', index: i },
        b: { id: 'arr', index: minIdx },
      });
      events.push({
        t: 'note',
        text: `Swapped minimum ${arr[i]} into sorted position arr[${i}]`,
      });
    }
    events.push({ t: 'visit', id: `arr[${i}]` });
  }
  if (n > 0) events.push({ t: 'visit', id: `arr[${n - 1}]` });
  events.push({ t: 'note', text: `Selection Sort complete: [${arr.join(', ')}]` });
  events.push({ t: 'done' });

  return {
    events,
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
    emitArrayInit(events, 'arr', arr, `Initialized array of ${arr.length} elements for Insertion Sort`);
  }

  const n = arr.length;
  if (n > 0) events.push({ t: 'visit', id: `arr[0]` });

  for (let i = 1; i < n; i++) {
    let j = i;
    events.push({ t: 'line', line: 2 });
    events.push({ t: 'note', text: `Inserting arr[${i}] = ${arr[i]} into sorted prefix [0..${i - 1}]` });

    while (j > 0) {
      events.push({ t: 'line', line: 4 });
      events.push({
        t: 'compare',
        a: { id: 'arr', index: j - 1 },
        b: { id: 'arr', index: j },
      });

      if (arr[j - 1] > arr[j]) {
        events.push({
          t: 'note',
          text: `${arr[j - 1]} > ${arr[j]} → shift left by swapping arr[${j - 1}] and arr[${j}]`,
        });
        const tmp = arr[j - 1];
        arr[j - 1] = arr[j];
        arr[j] = tmp;
        events.push({ t: 'line', line: 5 });
        events.push({
          t: 'swap',
          a: { id: 'arr', index: j - 1 },
          b: { id: 'arr', index: j },
        });
        j--;
      } else {
        events.push({
          t: 'note',
          text: `${arr[j - 1]} ≤ ${arr[j]} → element is in sorted position at index ${j}`,
        });
        break;
      }
    }
    events.push({ t: 'visit', id: `arr[${i}]` });
  }

  events.push({ t: 'note', text: `Insertion Sort complete: [${arr.join(', ')}]` });
  events.push({ t: 'done' });

  return {
    events,
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
    emitArrayInit(events, 'arr', arr, `Initialized array of ${arr.length} elements for Merge Sort`);
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
    events.push({ t: 'note', text: `Split range [${l}..${r}] at mid=${mid}` });

    events.push({ t: 'line', line: 4 });
    sort(l, mid, depth + 1);

    events.push({ t: 'line', line: 5 });
    sort(mid + 1, r, depth + 1);

    events.push({ t: 'line', line: 7 });
    events.push({ t: 'note', text: `Merging sorted subarrays [${l}..${mid}] and [${mid + 1}..${r}]` });

    const auxSlice: number[] = [];
    for (let k = l; k <= r; k++) {
      auxSlice[k] = arr[k];
      events.push({ t: 'set', target: { id: 'aux', index: k }, value: arr[k] });
    }

    let i = l;
    let j = mid + 1;
    for (let k = l; k <= r; k++) {
      if (i > mid) {
        arr[k] = auxSlice[j];
        events.push({ t: 'set', target: { id: 'arr', index: k }, value: auxSlice[j] });
        events.push({ t: 'note', text: `Copy remaining right half aux[${j}]=${auxSlice[j]} → arr[${k}]` });
        j++;
      } else if (j > r) {
        arr[k] = auxSlice[i];
        events.push({ t: 'set', target: { id: 'arr', index: k }, value: auxSlice[i] });
        events.push({ t: 'note', text: `Copy remaining left half aux[${i}]=${auxSlice[i]} → arr[${k}]` });
        i++;
      } else {
        events.push({
          t: 'compare',
          a: { id: 'aux', index: i },
          b: { id: 'aux', index: j },
        });
        if (auxSlice[i] <= auxSlice[j]) {
          arr[k] = auxSlice[i];
          events.push({ t: 'set', target: { id: 'arr', index: k }, value: auxSlice[i] });
          events.push({
            t: 'note',
            text: `${auxSlice[i]} ≤ ${auxSlice[j]} → write ${auxSlice[i]} to arr[${k}]`,
          });
          i++;
        } else {
          arr[k] = auxSlice[j];
          events.push({ t: 'set', target: { id: 'arr', index: k }, value: auxSlice[j] });
          events.push({
            t: 'note',
            text: `${auxSlice[j]} < ${auxSlice[i]} → write ${auxSlice[j]} to arr[${k}]`,
          });
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
  events.push({ t: 'note', text: `Merge Sort complete: [${arr.join(', ')}]` });
  events.push({ t: 'done' });

  return {
    events,
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
    emitArrayInit(events, 'arr', arr, `Initialized array of ${arr.length} elements for Quick Sort`);
  }

  function partition(low: number, high: number, depth: number): number {
    events.push({ t: 'call', fn: 'partition', args: [low, high], depth });
    const pivot = arr[high];
    let i = low - 1;
    events.push({ t: 'line', line: 2 });
    events.push({ t: 'note', text: `Partition [${low}..${high}] choosing pivot arr[${high}] = ${pivot}` });

    for (let j = low; j < high; j++) {
      events.push({ t: 'line', line: 4 });
      events.push({
        t: 'compare',
        a: { id: 'arr', index: j },
        b: { id: 'arr', index: high },
      });
      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          const tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
          events.push({ t: 'line', line: 5 });
          events.push({
            t: 'swap',
            a: { id: 'arr', index: i },
            b: { id: 'arr', index: j },
          });
        }
        events.push({
          t: 'note',
          text: `arr[${j}] (${arr[i]}) ≤ pivot (${pivot}) → placed in ≤-partition at index ${i}`,
        });
      } else {
        events.push({
          t: 'note',
          text: `arr[${j}] (${arr[j]}) > pivot (${pivot}) → stays in >-partition`,
        });
      }
    }

    const pivotFinal = i + 1;
    if (pivotFinal !== high) {
      const tmp = arr[pivotFinal];
      arr[pivotFinal] = arr[high];
      arr[high] = tmp;
      events.push({ t: 'line', line: 8 });
      events.push({
        t: 'swap',
        a: { id: 'arr', index: pivotFinal },
        b: { id: 'arr', index: high },
      });
    }
    events.push({ t: 'visit', id: `arr[${pivotFinal}]` });
    events.push({
      t: 'note',
      text: `Pivot ${pivot} locked into its final sorted index ${pivotFinal}`,
    });
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
      events.push({ t: 'visit', id: `arr[${low}]` });
    }
    events.push({ t: 'return', fn: 'quickSort' });
  }

  if (arr.length > 0) {
    sort(0, arr.length - 1, 0);
  }
  events.push({ t: 'note', text: `Quick Sort complete: [${arr.join(', ')}]` });
  events.push({ t: 'done' });

  return {
    events,
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
    emitArrayInit(events, 'arr', arr, `Starting insert of ${value} at index ${index}`);
  }

  const oldLen = arr.length;
  arr.push(0);
  events.push({ t: 'set', target: { id: 'arr', index: oldLen }, value: 0 });
  events.push({ t: 'line', line: 2 });
  events.push({ t: 'note', text: `Allocated slot at end (index ${oldLen}); shifting elements right` });

  for (let i = oldLen; i > index; i--) {
    arr[i] = arr[i - 1];
    events.push({ t: 'line', line: 3 });
    events.push({ t: 'set', target: { id: 'arr', index: i }, value: arr[i] });
    events.push({ t: 'note', text: `Shift arr[${i - 1}] (${arr[i]}) → arr[${i}]` });
  }

  arr[index] = value;
  events.push({ t: 'line', line: 5 });
  events.push({ t: 'set', target: { id: 'arr', index }, value });
  events.push({ t: 'visit', id: `arr[${index}]` });
  events.push({ t: 'note', text: `Inserted value ${value} at arr[${index}]` });
  events.push({ t: 'done' });

  return {
    events,
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
    emitArrayInit(events, 'arr', arr, `Starting delete at index ${rawIndex}`);
  }

  if (arr.length === 0) {
    events.push({ t: 'note', text: 'Array is already empty — nothing to delete' });
    events.push({ t: 'done' });
    return { events, finalArray: arr, meta: ARRAY_ALGORITHM_METADATA['delete-at'] };
  }

  const index = Math.max(0, Math.min(arr.length - 1, Math.floor(rawIndex)));
  const removedVal = arr[index];
  events.push({ t: 'line', line: 2 });
  events.push({ t: 'visit', id: `arr[${index}]` });
  events.push({ t: 'note', text: `Target for deletion: arr[${index}] = ${removedVal}` });

  for (let i = index; i < arr.length - 1; i++) {
    arr[i] = arr[i + 1];
    events.push({ t: 'line', line: 3 });
    events.push({ t: 'set', target: { id: 'arr', index: i }, value: arr[i] });
    events.push({ t: 'note', text: `Shift left: arr[${i + 1}] (${arr[i]}) → arr[${i}]` });
  }

  const lastIdx = arr.length - 1;
  arr.pop();
  events.push({ t: 'line', line: 5 });
  events.push({ t: 'remove', id: `arr[${lastIdx}]` });
  events.push({ t: 'note', text: `Deleted ${removedVal} from index ${index}; new length is ${arr.length}` });
  events.push({ t: 'done' });

  return {
    events,
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
    emitArrayInit(events, 'arr', arr, `Updating index ${rawIndex} to ${newValue}`);
  }

  if (arr.length === 0) {
    events.push({ t: 'note', text: 'Array is empty' });
    events.push({ t: 'done' });
    return { events, finalArray: arr, meta: ARRAY_ALGORITHM_METADATA['update-at'] };
  }

  const index = Math.max(0, Math.min(arr.length - 1, Math.floor(rawIndex)));
  const oldVal = arr[index];
  arr[index] = newValue;
  events.push({ t: 'line', line: 2 });
  events.push({ t: 'set', target: { id: 'arr', index }, value: newValue });
  events.push({ t: 'visit', id: `arr[${index}]` });
  events.push({ t: 'note', text: `Updated arr[${index}] from ${oldVal} → ${newValue}` });
  events.push({ t: 'done' });

  return {
    events,
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
    emitArrayInit(events, 'arr', arr, `Linear Search for target = ${target}`);
  }

  for (let i = 0; i < arr.length; i++) {
    events.push({ t: 'line', line: 2 });
    events.push({ t: 'visit', id: `arr[${i}]` });
    events.push({
      t: 'compare',
      a: { id: 'arr', index: i },
      b: { id: 'arr', index: i },
    });
    if (arr[i] === target) {
      events.push({ t: 'line', line: 3 });
      events.push({ t: 'note', text: `Found target ${target} at index ${i}!` });
      events.push({ t: 'done' });
      return { events, finalArray: arr, meta: ARRAY_ALGORITHM_METADATA['linear-search'] };
    }
    events.push({
      t: 'note',
      text: `arr[${i}] = ${arr[i]} ≠ ${target} → advance to index ${i + 1}`,
    });
  }

  events.push({ t: 'line', line: 5 });
  events.push({ t: 'note', text: `Target ${target} not found in array (returned -1)` });
  events.push({ t: 'done' });
  return { events, finalArray: arr, meta: ARRAY_ALGORITHM_METADATA['linear-search'] };
}

export function arrayBinarySearchTrace(
  input: number[],
  target: number,
  emitInit: boolean = true,
): ArrayTraceResult {
  // Binary search requires a sorted array; sort copy if unsorted so search works cleanly
  const arr = [...input].sort((a, b) => a - b);
  const events: TraceEvent[] = [];

  if (emitInit) {
    emitArrayInit(
      events,
      'arr',
      arr,
      `Binary Search for target = ${target} on sorted array [${arr.join(', ')}]`,
    );
  } else {
    // Ensure trace array matches sorted values if chained
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
        text: `arr[mid=${mid}] == ${target} → Target found at index ${mid}!`,
      });
      events.push({ t: 'done' });
      return { events, finalArray: arr, meta: ARRAY_ALGORITHM_METADATA['binary-search'] };
    }

    if (arr[mid] < target) {
      events.push({ t: 'line', line: 6 });
      events.push({
        t: 'note',
        text: `arr[mid=${mid}] (${arr[mid]}) < ${target} → search right half [${mid + 1}..${high}]`,
      });
      low = mid + 1;
    } else {
      events.push({ t: 'line', line: 7 });
      events.push({
        t: 'note',
        text: `arr[mid=${mid}] (${arr[mid]}) > ${target} → search left half [${low}..${mid - 1}]`,
      });
      high = mid - 1;
    }
  }

  events.push({ t: 'line', line: 9 });
  events.push({ t: 'note', text: `Target ${target} not found in array (returned -1)` });
  events.push({ t: 'done' });
  return { events, finalArray: arr, meta: ARRAY_ALGORITHM_METADATA['binary-search'] };
}

export function arrayReverseTrace(
  input: number[],
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];

  if (emitInit) {
    emitArrayInit(events, 'arr', arr, `Reversing array of ${arr.length} elements in-place`);
  }

  let left = 0;
  let right = arr.length - 1;
  events.push({ t: 'line', line: 2 });

  while (left < right) {
    events.push({ t: 'line', line: 4 });
    const tmp = arr[left];
    arr[left] = arr[right];
    arr[right] = tmp;
    events.push({
      t: 'swap',
      a: { id: 'arr', index: left },
      b: { id: 'arr', index: right },
    });
    events.push({ t: 'visit', id: `arr[${left}]` });
    events.push({ t: 'visit', id: `arr[${right}]` });
    events.push({
      t: 'note',
      text: `Swapped arr[${left}] and arr[${right}] (${arr[left]} ⇄ ${arr[right]})`,
    });
    left++;
    right--;
  }

  events.push({ t: 'note', text: `Array reversed: [${arr.join(', ')}]` });
  events.push({ t: 'done' });
  return { events, finalArray: arr, meta: ARRAY_ALGORITHM_METADATA['reverse'] };
}

export function arrayRotateTrace(
  input: number[],
  steps: number = 1,
  emitInit: boolean = true,
): ArrayTraceResult {
  const arr = [...input];
  const events: TraceEvent[] = [];

  if (emitInit) {
    emitArrayInit(events, 'arr', arr, `Rotating array left by ${steps} position(s)`);
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
    events.push({ t: 'note', text: `Rotation ${rot + 1}/${k}: save first element ${first}` });
    for (let i = 0; i < n - 1; i++) {
      arr[i] = arr[i + 1];
      events.push({ t: 'line', line: 4 });
      events.push({ t: 'set', target: { id: 'arr', index: i }, value: arr[i] });
    }
    arr[n - 1] = first;
    events.push({ t: 'line', line: 6 });
    events.push({ t: 'set', target: { id: 'arr', index: n - 1 }, value: first });
    events.push({ t: 'visit', id: `arr[${n - 1}]` });
    events.push({ t: 'note', text: `Placed ${first} at tail arr[${n - 1}]` });
  }

  events.push({ t: 'note', text: `Rotation complete: [${arr.join(', ')}]` });
  events.push({ t: 'done' });
  return { events, finalArray: arr, meta: ARRAY_ALGORITHM_METADATA['rotate'] };
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

