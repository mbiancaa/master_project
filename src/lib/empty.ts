const emptyCanvas = {
  createCanvas: () => ({
    getContext: () => null,
  }),
  DOMMatrix: typeof DOMMatrix !== "undefined" ? DOMMatrix : class {},
  Path2D: typeof Path2D !== "undefined" ? Path2D : class {},
};

export default emptyCanvas;
