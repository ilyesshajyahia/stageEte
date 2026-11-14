export async function chartToImage(chartRef) {
  if (!chartRef || !chartRef.current) return null;
  const canvas = chartRef.current.canvas;
  const dataUrl = canvas.toDataURL("image/png", 1.0);
  return dataUrl;
}
