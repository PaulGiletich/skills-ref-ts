#!/usr/bin/env node

import * as path from "path";
import * as fs from "fs";
import { Command } from "commander";
import { readProperties } from "./parser.js";
import { toPrompt } from "./prompt.js";
import { validate } from "./validator.js";

const program = new Command();

function isSkillMdFile(filePath: string): boolean {
  return (
    fs.statSync(filePath).isFile() &&
    path.basename(filePath).toLowerCase() === "skill.md"
  );
}

program
  .name("skills-reference")
  .description("Reference library for Agent Skills")
  .version("1.0.0");

program
  .command("validate")
  .description("Validate a skill directory")
  .argument("<skillPath>", "Path to skill directory or SKILL.md file")
  .action((skillPath: string) => {
    try {
      let resolved = path.resolve(skillPath);

      if (isSkillMdFile(resolved)) {
        resolved = path.dirname(resolved);
      }

      const errors = validate(resolved);

      if (errors.length > 0) {
        console.error(`Validation failed for ${resolved}:`);
        errors.forEach((error) => {
          console.error(`  - ${error}`);
        });
        process.exit(1);
      } else {
        console.log(`Valid skill: ${resolved}`);
      }
    } catch (err) {
      console.error(
        `Error: ${err instanceof Error ? err.message : String(err)}`,
      );
      process.exit(1);
    }
  });

program
  .command("read-properties")
  .description("Read and print skill properties as JSON")
  .argument("<skillPath>", "Path to skill directory or SKILL.md file")
  .action((skillPath: string) => {
    try {
      let resolved = path.resolve(skillPath);

      if (isSkillMdFile(resolved)) {
        resolved = path.dirname(resolved);
      }

      const props = readProperties(resolved);
      console.log(JSON.stringify(props.toDict(), null, 2));
    } catch (err) {
      console.error(
        `Error: ${err instanceof Error ? err.message : String(err)}`,
      );
      process.exit(1);
    }
  });

program
  .command("to-prompt")
  .description("Generate <available_skills> XML for agent prompts")
  .argument("<skillPaths...>", "Paths to skill directories or SKILL.md files")
  .action((skillPaths: string[]) => {
    try {
      const dirs = skillPaths.map((skillPath) => {
        const resolved = path.resolve(skillPath);
        return isSkillMdFile(resolved) ? path.dirname(resolved) : resolved;
      });

      const prompt = toPrompt(dirs);
      console.log(prompt);
    } catch (err) {
      console.error(
        `Error: ${err instanceof Error ? err.message : String(err)}`,
      );
      process.exit(1);
    }
  });

program.parse(process.argv);
