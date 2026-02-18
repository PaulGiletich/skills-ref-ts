import { describe, test, expect } from "bun:test";
import { parseFrontmatter } from "./parser.js";

describe("parseFrontmatter", () => {
  test("parses basic frontmatter", () => {
    const content = `---
name: my-skill
description: A skill
---
# Body content`;

    const result = parseFrontmatter(content);
    expect(result.metadata.name).toBe("my-skill");
    expect(result.metadata.description).toBe("A skill");
    expect(result.body).toBe("# Body content");
  });

  test("throws when content does not start with ---", () => {
    expect(() => parseFrontmatter("no frontmatter")).toThrow(
      "must start with YAML frontmatter",
    );
  });

  test("throws when frontmatter is not closed", () => {
    expect(() => parseFrontmatter("---\nname: test\n")).toThrow(
      "not properly closed",
    );
  });

  test("preserves body containing --- delimiters (frontmatter example in body)", () => {
    const content = `---
name: adding-skills
description: Guide for adding new skills
---
# Adding Skills

Here's an example SKILL.md:

\`\`\`markdown
---
name: example-skill
description: An example
---
# Example body
\`\`\`

More content after the example.`;

    const result = parseFrontmatter(content);
    expect(result.metadata.name).toBe("adding-skills");
    expect(result.metadata.description).toBe("Guide for adding new skills");
    expect(result.body).toContain("Here's an example SKILL.md:");
    expect(result.body).toContain("name: example-skill");
    expect(result.body).toContain("# Example body");
    expect(result.body).toContain("More content after the example.");
  });

  test("preserves body with horizontal rules (---)", () => {
    const content = `---
name: test-skill
description: Test
---
# Section 1

---

# Section 2`;

    const result = parseFrontmatter(content);
    expect(result.metadata.name).toBe("test-skill");
    expect(result.body).toContain("# Section 1");
    expect(result.body).toContain("---");
    expect(result.body).toContain("# Section 2");
  });
});
