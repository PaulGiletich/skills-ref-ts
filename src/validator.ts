import * as fs from "fs";
import * as path from "path";
import { findSkillMd, parseFrontmatter } from "./parser.js";

const MAX_SKILL_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;
const MAX_COMPATIBILITY_LENGTH = 500;

const ALLOWED_FIELDS = new Set([
  "name",
  "description",
  "license",
  "allowed-tools",
  "metadata",
  "compatibility",
]);

function normalizeString(value: string): string {
  return value.normalize("NFKC");
}

function validateName(name: any, skillDir?: string): string[] {
  const errors: string[] = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Field 'name' must be a non-empty string");
    return errors;
  }

  const normalized = normalizeString(name.trim());

  if (normalized.length > MAX_SKILL_NAME_LENGTH) {
    errors.push(
      `Skill name '${normalized}' exceeds ${MAX_SKILL_NAME_LENGTH} character limit (${normalized.length} chars)`,
    );
  }

  if (normalized !== normalized.toLowerCase()) {
    errors.push(`Skill name '${normalized}' must be lowercase`);
  }

  if (normalized.startsWith("-") || normalized.endsWith("-")) {
    errors.push("Skill name cannot start or end with a hyphen");
  }

  if (normalized.includes("--")) {
    errors.push("Skill name cannot contain consecutive hyphens");
  }

  if (!/^[a-z0-9-]+$/.test(normalized)) {
    errors.push(
      `Skill name '${normalized}' contains invalid characters. Only letters, digits, and hyphens are allowed.`,
    );
  }

  if (skillDir) {
    if (normalizeString(path.basename(skillDir)) !== normalized) {
      errors.push(
        `Directory name '${path.basename(skillDir)}' must match skill name '${normalized}'`,
      );
    }
  }

  return errors;
}

function validateDescription(description: any): string[] {
  const errors: string[] = [];

  if (!description || typeof description !== "string" || !description.trim()) {
    errors.push("Field 'description' must be a non-empty string");
    return errors;
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(
      `Description exceeds ${MAX_DESCRIPTION_LENGTH} character limit (${description.length} chars)`,
    );
  }

  return errors;
}

function validateCompatibility(compatibility: any): string[] {
  const errors: string[] = [];

  if (typeof compatibility !== "string") {
    errors.push("Field 'compatibility' must be a string");
    return errors;
  }

  if (compatibility.length > MAX_COMPATIBILITY_LENGTH) {
    errors.push(
      `Compatibility exceeds ${MAX_COMPATIBILITY_LENGTH} character limit (${compatibility.length} chars)`,
    );
  }

  return errors;
}

function validateMetadataFields(metadata: Record<string, any>): string[] {
  const errors: string[] = [];

  const unknownFields = Object.keys(metadata).filter(
    (key) => !ALLOWED_FIELDS.has(key),
  );

  if (unknownFields.length > 0) {
    errors.push(
      `Unexpected fields in frontmatter: ${unknownFields.sort().join(", ")}. Only ${Array.from(ALLOWED_FIELDS).sort().join(", ")} are allowed.`,
    );
  }

  return errors;
}

export function validateMetadata(
  metadata: Record<string, any>,
  skillDir?: string,
): string[] {
  const errors: string[] = [];

  errors.push(...validateMetadataFields(metadata));

  if (metadata.name) {
    errors.push(...validateName(metadata.name, skillDir));
  } else {
    errors.push("Missing required field in frontmatter: name");
  }

  if (metadata.description) {
    errors.push(...validateDescription(metadata.description));
  } else {
    errors.push("Missing required field in frontmatter: description");
  }

  if (metadata.compatibility) {
    errors.push(...validateCompatibility(metadata.compatibility));
  }

  return errors;
}

export function validate(skillDir: string): string[] {
  const resolved = path.resolve(skillDir);

  if (!fs.existsSync(resolved)) {
    return [`Path does not exist: ${resolved}`];
  }

  if (!fs.statSync(resolved).isDirectory()) {
    return [`Not a directory: ${resolved}`];
  }

  const skillMdPath = findSkillMd(resolved);
  if (!skillMdPath) {
    return ["Missing required file: SKILL.md"];
  }

  try {
    const content = fs.readFileSync(skillMdPath, "utf8");
    const { metadata } = parseFrontmatter(content);
    return validateMetadata(metadata, resolved);
  } catch (err) {
    return [err instanceof Error ? err.message : String(err)];
  }
}
