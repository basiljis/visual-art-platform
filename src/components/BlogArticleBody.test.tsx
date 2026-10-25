import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BlogArticleBody } from "./BlogArticleBody";

vi.mock("@/lib/language", () => ({ useLanguage: () => ({ lang: "ru" }) }));

describe("Article photos", () => {
  it("preserves text and video while navigating every photo in source order", () => {
    const { container } = render(<BlogArticleBody html={'<p>Story before</p><img src="/one.jpg"><img src="/two.jpg"><p>Story after</p><video controls><source src="/film.webm" type="video/webm"></video><img src="/three.jpg">'} />);
    expect(container.querySelectorAll('[data-blog-gallery]')).toHaveLength(2);
    expect(screen.getByText('Story before')).toBeTruthy();
    expect(screen.getByText('Story after')).toBeTruthy();
    expect(container.querySelector('video source')?.getAttribute('src')).toBe('/film.webm');
    fireEvent.click(screen.getByRole('button', { name: 'Открыть фотографию 2' }));
    expect(screen.getByRole('dialog').querySelector('img')?.getAttribute('src')).toBe('/two.jpg');
    fireEvent.click(screen.getByRole('button', { name: 'Следующая фотография' }));
    expect(screen.getByRole('dialog').querySelector('img')?.getAttribute('src')).toBe('/three.jpg');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
    expect(screen.getByRole('dialog').querySelector('img')?.getAttribute('src')).toBe('/one.jpg');
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});