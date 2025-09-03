/* eslint-env worker */
/* global globalThis */
// Worker module that renders requested PDF pages using pdfjs and OffscreenCanvas
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
// Ensure pdfjs worker is available inside this worker too (some bundlers require it)
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

globalThis.onmessage = async (ev) => {
  const msg = ev.data || {};
  if(msg.type !== 'renderBatch') return;
  try{
    const { arrayBuffer, pages, scale } = msg;
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    for(const i of pages){
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: scale || 1.5 });
      const canvas = new OffscreenCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      // Transfer blob to main thread
      globalThis.postMessage({ type: 'page', index: i, blob }, []);
      try{ page.cleanup && page.cleanup(); }catch(e){}
    }

    globalThis.postMessage({ type: 'done' });
    try{ loadingTask.destroy && loadingTask.destroy(); }catch(e){}
  }catch(err){
    globalThis.postMessage({ type: 'error', message: err && err.message ? err.message : String(err) });
  }
};
