/**
 * Quelle: https://pspdfkit.com/blog/2021/how-to-build-a-bootstrap5-pdf-viewer-with-pdfjs/
 */
// script.js
const tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
const tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

// script.js
const pdf = "images/aoa.pdf";

const pageNum = document.querySelector("#page_num");
const pageCount = document.querySelector("#page_count");
const currentPage = document.querySelector("#current_page");
const previousPage = document.querySelector("#prev_page");
const nextPage = document.querySelector("#next_page");
const zoomIn = document.querySelector("#zoom_in");
const zoomOut = document.querySelector("#zoom_out");

const initialState = {
  pdfDoc: null,
  currentPage: 1,
  pageCount: 0,
  zoom: 1,
};

// Load the document.
pdfjsLib
  .getDocument(pdf)
  .promise.then((data) => {
    initialState.pdfDoc = data;
    console.log("pdfDocument", initialState.pdfDoc);

    pageCount.textContent = initialState.pdfDoc.numPages;

    renderPage();
  })
  .catch((err) => {
    alert(err.message);
  });

// Render the page.
const renderPage = () => {
  // Load the first page.
  initialState.pdfDoc.getPage(initialState.currentPage).then((page) => {
    console.log("page", page);

    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    const viewport = page.getViewport({
      scale: initialState.zoom,
    });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the PDF page into the canvas context.
    const renderCtx = {
      canvasContext: ctx,
      viewport: viewport,
    };

    page.render(renderCtx);

    pageNum.textContent = initialState.currentPage;
  });
};

const showPrevPage = () => {
  if (initialState.pdfDoc === null || initialState.currentPage <= 1) return;
  initialState.currentPage--;
  // Render the current page.
  currentPage.value = initialState.currentPage;
  renderPage();
};

const showNextPage = () => {
  if (
    initialState.pdfDoc === null ||
    initialState.currentPage >= initialState.pdfDoc._pdfInfo.numPages
  )
    return;

  initialState.currentPage++;
  currentPage.value = initialState.currentPage;
  renderPage();
};

// Button events.
previousPage.addEventListener("click", showPrevPage);
nextPage.addEventListener("click", showNextPage);

currentPage.addEventListener("keypress", (event) => {
  if (initialState.pdfDoc === null) return;
  // Get the key code.
  const keycode = event.keyCode ? event.keyCode : event.which;

  if (keycode === 13) {
    // Get the new page number and render it.
    let desiredPage = currentPage.valueAsNumber;
    initialState.currentPage = Math.min(
      Math.max(desiredPage, 1),
      initialState.pdfDoc._pdfInfo.numPages
    );
    currentPage.value = initialState.currentPage;
    renderPage();
  }
});

zoomIn.addEventListener("click", () => {
  if (initialState.pdfDoc === null) return;
  initialState.zoom *= 4 / 3;
  renderPage();
});

zoomOut.addEventListener("click", () => {
  if (initialState.pdfDoc === null) return;
  initialState.zoom *= 2 / 3;
  renderPage();
});
