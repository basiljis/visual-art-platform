import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ZoomImage } from "./ViewerStage";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("enlarges a painting on press and restores it on the next press", () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  const { getByAltText } = render(<ZoomImage src="/painting.jpg" alt="Painting" resetKey="painting" />);
  const image = getByAltText("Painting");
  fireEvent.pointerDown(image, { button: 0, clientX: 100, clientY: 100 });
  fireEvent.pointerUp(image, { button: 0, clientX: 100, clientY: 100 });
  expect(image.style.transform).toContain("scale(2.5)");
  fireEvent.pointerDown(image, { button: 0, clientX: 100, clientY: 100 });
  fireEvent.pointerUp(image, { button: 0, clientX: 100, clientY: 100 });
  expect(image.style.transform).toBe("translate(0px, 0px) scale(1)");
});