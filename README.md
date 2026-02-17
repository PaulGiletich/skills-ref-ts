# skills-ref-ts

[![npm version](https://img.shields.io/npm/v/skills-ref-ts)](https://www.npmjs.com/package/skills-ref-ts)

TypeScript port of the Agent Skills reference tooling. Mirrors the Python `skills-ref`.

## Installation

### Prerequisites

- Node.js (v14.0.0 or higher)
- bun or npm

### From npm

```bash
# Install the package
npm install skills-ref-ts
```

## Usage

### CLI

```bash
# Validate a skill
skills-ref-ts validate path/to/skill

# Read skill properties (outputs JSON)
skills-ref-ts read-properties path/to/skill

# Generate <available_skills> XML for agent prompts
skills-ref-ts to-prompt path/to/skill-a path/to/skill-b
```

### JS API

```typescript
import {
  validate,
  validateMetadata,
  readProperties,
  toPrompt,
} from "skills-ref-ts";

// Validate a skill directory
const errors = validate("path/to/skill");
if (errors.length > 0) {
  console.log("Validation errors:", errors);
}

// Validate metadata only
const skillMetadata = {
  name: "pdf-processing",
  description:
    "Extract text and tables from PDF files, fill forms, merge documents.",
  license: "Apache-2.0",
  metadata: {
    author: "example-org",
    version: "1.0",
  },
};
const metadataErrors = validateMetadata(skillMetadata);
if (metadataErrors.length > 0) {
  console.log("Metadata validation errors:", metadataErrors);
}

// Read skill properties
const props = readProperties("path/to/skill");
console.log(`Skill: ${props.name} - ${props.description}`);

// Generate prompt for available skills
const prompt = toPrompt(["path/to/skill-a", "path/to/skill-b"]);
console.log(prompt);
```

## License

MIT

## Thank you

This repo was bootstrapped by unminifying from [`skills-reference@1.0.7`](https://www.npmjs.com/package/skills-reference/v/1.0.7).
There was no source code available, so i had to spin up my own fork of the package.
