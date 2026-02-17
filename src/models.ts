export interface SkillProperties {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  allowedTools?: string;
  metadata: Record<string, string>;
  toDict(): Record<string, any>;
}

export class SkillPropertiesImpl implements SkillProperties {
  name: string;
  description: string;
  license?: string | undefined;
  compatibility?: string | undefined;
  allowedTools?: string | undefined;
  metadata: Record<string, string>;

  constructor(
    name: string,
    description: string,
    license?: string | undefined,
    compatibility?: string | undefined,
    allowedTools?: string | undefined,
    metadata: Record<string, string> = {},
  ) {
    this.name = name;
    this.description = description;
    this.license = license;
    this.compatibility = compatibility;
    this.allowedTools = allowedTools;
    this.metadata = metadata;
  }

  toDict(): Record<string, any> {
    const result: Record<string, any> = {
      name: this.name,
      description: this.description,
    };

    if (this.license) {
      result.license = this.license;
    }

    if (this.compatibility) {
      result.compatibility = this.compatibility;
    }

    if (this.allowedTools) {
      result["allowed-tools"] = this.allowedTools;
    }

    if (Object.keys(this.metadata).length > 0) {
      result.metadata = this.metadata;
    }

    return result;
  }
}
