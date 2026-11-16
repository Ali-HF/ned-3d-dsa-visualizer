import { describe, it, expect } from 'vitest';
import { runCorpusStructureOperation } from '../../src/engine/corpusRunner';
import { useViewportStore, buildSceneObjectsForScene } from '../../src/state/useViewportStore';
import { STRUCTURE_OP_CATALOG, type StructureOperationId } from '../../src/algorithms/structures/structureAlgorithms';
import { getCorpusRawText } from '../../src/corpus/cppCorpusRegistry';

interface AuditFailure {
  corpusPath: string;
  opId: StructureOperationId;
  check: string;
  step: number;
  expected: string;
  actual: string;
}

describe('DSA Structure Audit — Queue, Tree, Heap, Graph', () => {
  const targetCategories = new Set([
    '05_queues_and_deque',
    '09_binary_tree',
    '10_heap_and_priority_queue',
    '11_binary_search_tree',
    '12_avl_tree',
    '13_graph_traversal',
    '14_graph_mst_toposort',
  ]);

  const opsToAudit = STRUCTURE_OP_CATALOG.filter((cat) => {
    const folder = cat.corpusPath.split('/')[0];
    return targetCategories.has(folder);
  });

  it('runs comprehensive DSA check across all target operations', () => {
    const failures: AuditFailure[] = [];

    for (const opMeta of opsToAudit) {
      const opId = opMeta.id;
      const corpusPath = opMeta.corpusPath;
      const rawCpp = getCorpusRawText(corpusPath) ?? '';
      
      const res = runCorpusStructureOperation(opId, [15, 30, 45, 60, 75], 55);

      if (!res || !res.events || res.events.length === 0) {
        failures.push({
          corpusPath,
          opId,
          check: 'Trace Generation',
          step: 0,
          expected: 'Non-empty operation trace with events',
          actual: `Events length: ${res?.events?.length ?? 0}`,
        });
        continue;
      }

      // Check for redundant identical steps
      let prevSig = '';
      for (let i = 0; i < res.events.length; i++) {
        const ev = res.events[i];
        const sig = `${ev.t}:${ev.line}:${JSON.stringify(ev)}`;
        if (sig === prevSig && ev.t !== 'done') {
          failures.push({
            corpusPath,
            opId,
            check: 'Redundant Consecutive Step',
            step: i,
            expected: 'Distinct step',
            actual: `Duplicate signature: ${sig}`,
          });
        }
        prevSig = sig;
      }

      // Load into viewportStore and step through
      const store = useViewportStore.getState();
      store.setCustomArray([15, 30, 45, 60, 75]);
      store.runStructureOperationNow(opId, 55);

      const timeline = useViewportStore.getState().timeline;
      if (!timeline) {
        failures.push({
          corpusPath,
          opId,
          check: 'Timeline Loaded',
          step: 0,
          expected: 'TraceTimeline populated',
          actual: 'null',
        });
        continue;
      }

      const totalSteps = timeline.totalSteps;
      const folder = corpusPath.split('/')[0];

      for (let s = 1; s <= totalSteps; s++) {
        const snap = timeline.getSnapshotAt(s);
        const activeLine = snap.activeLine ?? 1;

        // Check activeLine is positive and within file length
        const lineCount = rawCpp.split('\n').length;
        if (activeLine <= 0 || activeLine > lineCount + 20) {
          failures.push({
            corpusPath,
            opId,
            check: 'Valid Active Line',
            step: s,
            expected: `1 <= activeLine <= ${lineCount}`,
            actual: `activeLine = ${activeLine}`,
          });
        }

        // Category-specific invariants
        const sceneObjs = buildSceneObjectsForScene(useViewportStore.getState().previewScene, snap);
        if (folder === '10_heap_and_priority_queue') {
          if (s === 1 || s === totalSteps) {
            console.log(`[Heap Debug] op=${opId} step=${s} nodes=${Object.keys(snap.nodes).length} arrays=${Object.keys(snap.arrays)} objs=${sceneObjs.length} scene=${useViewportStore.getState().previewScene}`);
            if (sceneObjs.length > 0) {
              console.log('Sample heap objs:', sceneObjs.map(o => ({ id: o.id, kind: o.kind, pos: o.position, val: o.value })));
            }
          }
        }
        if (folder === '05_queues_and_deque') {
          // If queue scene, verify 3D objects or renderable elements exist
          if (sceneObjs.length === 0 && s === totalSteps && opId !== 'queue-dequeue') {
            failures.push({
              corpusPath,
              opId,
              check: 'Queue Visual Elements Non-Empty',
              step: s,
              expected: 'Renderable queue 3D objects',
              actual: '0 elements',
            });
          }
        }

        if (folder === '11_binary_search_tree' && s === totalSteps) {
          // Check BST property
          const nodes = snap.nodes;
          for (const edge of snap.edges) {
            const pNode = nodes[edge.from];
            const cNode = nodes[edge.to];
            if (pNode && cNode && typeof pNode.value === 'number' && typeof cNode.value === 'number') {
              if (edge.label === 'left' && cNode.value >= pNode.value) {
                failures.push({
                  corpusPath,
                  opId,
                  check: 'BST Invariant (left < parent)',
                  step: s,
                  expected: `${cNode.value} < ${pNode.value}`,
                  actual: `left child ${cNode.value} >= parent ${pNode.value}`,
                });
              } else if (edge.label === 'right' && cNode.value <= pNode.value) {
                failures.push({
                  corpusPath,
                  opId,
                  check: 'BST Invariant (right > parent)',
                  step: s,
                  expected: `${cNode.value} > ${pNode.value}`,
                  actual: `right child ${cNode.value} <= parent ${pNode.value}`,
                });
              }
            }
          }
        }
      }
    }

    console.log(`[DSA Structure Audit] Audited ${opsToAudit.length} operations. Found ${failures.length} issues.`);
    if (failures.length > 0) {
      console.table(failures);
    }
    expect(failures).toEqual([]);
  });
});
