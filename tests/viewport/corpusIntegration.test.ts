import { describe, it, expect } from 'vitest';
import {
  CORPUS_FILE_CATALOG,
  getCorpusRawText,
  getCorpusCodeLines,
} from '../../src/corpus/cppCorpusRegistry';
import { executeCustomCodeTrace } from '../../src/engine/codeRunner';
import { STRUCTURE_OP_CATALOG } from '../../src/algorithms/structures/structureAlgorithms';
import { useViewportStore } from '../../src/state/useViewportStore';

describe('CT-159 C++ Corpus Integration (All 33 Files)', () => {
  it('registers all 33 C++ files with valid source content', () => {
    expect(CORPUS_FILE_CATALOG.length).toBe(33);
    for (const entry of CORPUS_FILE_CATALOG) {
      const raw = getCorpusRawText(entry.relativePath);
      expect(raw, `${entry.relativePath} should exist`).not.toContain(
        '// C++ file not found in cpp_corpus/',
      );
      expect(raw.trim().length, `${entry.relativePath} should not be empty`).toBeGreaterThan(20);

      const lines = getCorpusCodeLines(entry.relativePath);
      expect(lines.length).toBeGreaterThan(5);
    }
  });

  it('ensures every STRUCTURE_OP_CATALOG corpusPath resolves to an existing C++ file', () => {
    for (const op of STRUCTURE_OP_CATALOG) {
      const raw = getCorpusRawText(op.corpusPath);
      expect(raw, `Structure op ${op.id} -> ${op.corpusPath}`).not.toContain(
        '// C++ file not found in cpp_corpus/',
      );
    }
  });

  it('runs selectAndRunCorpusFile cleanly for all 33 corpus files', () => {
    const store = useViewportStore.getState();
    for (const entry of CORPUS_FILE_CATALOG) {
      store.selectAndRunCorpusFile(entry.relativePath);
      const state = useViewportStore.getState();
      expect(state.selectedCorpusFile).toBe(entry.relativePath);
      expect(state.previewScene).toBe(entry.scene);
      expect(state.totalSteps, `${entry.relativePath} totalSteps`).toBeGreaterThan(1);
      // Verify at least one step along the timeline has visible 3D objects
      const hasObjects =
        Object.keys(state.sceneObjects).length > 0 ||
        Object.keys(state.timeline.getSnapshotAt(Math.ceil(state.totalSteps / 2)).nodes).length > 0;
      expect(hasObjects, `${entry.relativePath} should render 3D objects`).toBe(true);
      expect(state.activeMetadata.code.length).toBeGreaterThan(5);
    }
  });

  it('executes every C++ file via executeCustomCodeTrace on its matching 3D scene', () => {
    const defaultArr = [42, 17, 68, 29, 84, 12];
    for (const entry of CORPUS_FILE_CATALOG) {
      const raw = getCorpusRawText(entry.relativePath);
      const fileName = entry.relativePath.split('/')[1];
      const result = executeCustomCodeTrace(
        raw,
        defaultArr,
        entry.relativePath,
        fileName,
      );
      expect(result.events.length, `${entry.relativePath} events`).toBeGreaterThan(1);
      expect(
        result.scene,
        `${entry.relativePath} expected scene '${entry.scene}', got '${result.scene}' (mode: ${result.executionMode})`,
      ).toBe(entry.scene);
    }
  });
});
