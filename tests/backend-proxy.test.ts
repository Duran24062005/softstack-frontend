import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { DELETE, GET, PATCH, POST, PUT } from "@/app/api/backend/[...path]/route";

describe("backend BFF proxy", () => {
  it("preserves method, query string, headers and body without caching", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response("ok", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const request = new NextRequest("http://frontend.local/api/backend/assessments/lessons/lesson-1?include=attempts", {
      method: "POST",
      headers: { cookie: "session=abc", "content-type": "application/json", "x-request-id": "trace-1" },
      body: JSON.stringify({ answer: "a" }),
    });

    await expect(GET(request, { params: Promise.resolve({ path: ["assessments", "lessons", "lesson-1"] }) })).resolves.toEqual(expect.any(Response));

    const [forwarded] = fetchMock.mock.calls[0];
    expect(forwarded).toBeInstanceOf(Request);
    expect((forwarded as Request).url).toBe("http://localhost:8000/assessments/lessons/lesson-1?include=attempts");
    expect((forwarded as Request).method).toBe("POST");
    expect((forwarded as Request).headers.get("cookie")).toBe("session=abc");
    expect((forwarded as Request).headers.get("x-request-id")).toBe("trace-1");
    expect(await (forwarded as Request).text()).toBe(JSON.stringify({ answer: "a" }));
  });

  it("exposes the same proxy for every supported HTTP method", () => {
    expect(POST).toBe(GET);
    expect(PATCH).toBe(GET);
    expect(PUT).toBe(GET);
    expect(DELETE).toBe(GET);
  });
});
