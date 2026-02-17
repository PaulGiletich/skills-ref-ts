import * as path from "path";
import { findSkillMd, readProperties } from "./parser.js";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function toPrompt(skillDirs: string[]): string {
  if (!skillDirs || skillDirs.length === 0) {
    return "<available_skills>\n</available_skills>";
  }

  const lines: string[] = ["<available_skills>"];

  for (const dir of skillDirs) {
    const resolved = path.resolve(dir);
    const props = readProperties(resolved);

    lines.push("<skill>");
    lines.push("<name>");
    lines.push(escapeHtml(props.name));
    lines.push("</name>");
    lines.push("<description>");
    lines.push(escapeHtml(props.description));
    lines.push("</description>");

    const skillMdPath = findSkillMd(resolved);
    if (skillMdPath) {
      lines.push("<location>");
      lines.push(skillMdPath);
      lines.push("</location>");
    }

    lines.push("</skill>");
  }

  lines.push("</available_skills>");

  return lines.join("\n");
}
