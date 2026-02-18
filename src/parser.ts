import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { ParseError, ValidationError } from "./errors.js";
import { SkillProperties, SkillPropertiesImpl } from "./models.js";

export function findSkillMd(skillDir: string): string | null {
  const resolved = path.resolve(skillDir);

  for (const filename of ["SKILL.md", "skill.md"]) {
    const filePath = path.join(resolved, filename);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

export function parseFrontmatter(content: string): {
  metadata: Record<string, any>;
  body: string;
} {
  if (!content.startsWith("---")) {
    throw new ParseError("SKILL.md must start with YAML frontmatter (---)");
  }

  // Find the closing --- delimiter (must appear on its own line after the opening ---)
  const closingIndex = content.indexOf("\n---", 3);

  if (closingIndex === -1) {
    throw new ParseError("SKILL.md frontmatter not properly closed with ---");
  }

  const yamlContent = content.substring(3, closingIndex);
  const body = content.substring(closingIndex + 4).trim();

  try {
    const metadata = yaml.load(yamlContent) as Record<string, any>;

    if (typeof metadata !== "object" || metadata === null) {
      throw new ParseError("SKILL.md frontmatter must be a YAML mapping");
    }

    // Convert metadata values to strings
    if (
      metadata.metadata &&
      typeof metadata.metadata === "object" &&
      metadata.metadata !== null
    ) {
      metadata.metadata = Object.entries(
        metadata.metadata as Record<string, unknown>,
      ).reduce(
        (acc: Record<string, string>, [key, value]) => {
          acc[key] = String(value);
          return acc;
        },
        {} as Record<string, string>,
      );
    }

    return { metadata, body };
  } catch (err) {
    throw new ParseError(
      `Invalid YAML in frontmatter: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export function readProperties(skillDir: string): SkillProperties {
  const resolved = path.resolve(skillDir);
  const skillMdPath = findSkillMd(resolved);

  if (!skillMdPath) {
    throw new ParseError(`SKILL.md not found in ${resolved}`);
  }

  const content = fs.readFileSync(skillMdPath, "utf8");
  const { metadata } = parseFrontmatter(content);

  if (!metadata.name) {
    throw new ValidationError(
      "Missing required field in frontmatter: name",
    );
  }

  if (!metadata.description) {
    throw new ValidationError(
      "Missing required field in frontmatter: description",
    );
  }

  const name = String(metadata.name).trim();
  const description = String(metadata.description).trim();

  if (!name) {
    throw new ValidationError("Field 'name' must be a non-empty string");
  }

  if (!description) {
    throw new ValidationError(
      "Field 'description' must be a non-empty string",
    );
  }

  return new SkillPropertiesImpl(
    name,
    description,
    metadata.license ? String(metadata.license) : undefined,
    metadata.compatibility ? String(metadata.compatibility) : undefined,
    metadata["allowed-tools"] ? String(metadata["allowed-tools"]) : undefined,
    metadata.metadata || {},
  );
}
