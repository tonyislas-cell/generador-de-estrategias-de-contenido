import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// `server-only`'s real export throws unconditionally unless the bundler sets
// the "react-server" condition (which Next does for Server Components/Route
// Handlers, but Vite/Vitest never does). Neutralize it so files that import
// it for build-time safety don't crash at test-load time.
vi.mock("server-only", () => ({}));

// jsdom ships no IntersectionObserver, and Motion's `whileInView` (used by the
// landing's reveal-on-scroll) constructs one on mount. This stub reports the
// element as immediately in view, which is what we want under test: the
// assertions are about content being present, not about scroll choreography.
class IntersectionObserverStub implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

// No .env.local in the test environment — these are fake values so
// src/lib/admin-auth.ts's eager env checks don't throw on import. 64 hex
// chars (32 bytes) satisfies jose's HS256 minimum key length.
process.env.ADMIN_PASSWORD ||= "test-admin-password";
process.env.ADMIN_SESSION_SECRET ||=
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd";
