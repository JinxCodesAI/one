import { z } from "zod";

// deno-lint-ignore no-explicit-any
type JsonSchema = Record<string, any>;

export function convertJsonSchemaToZod(schema: JsonSchema): z.ZodType<any> {
  if (!schema || typeof schema !== "object") {
    throw new Error("Invalid JSON schema: schema must be an object.");
  }

  const { type, properties, items, description } = schema;

  let zodType: z.ZodType<any>;

  switch (type) {
    case "string":
      zodType = z.string();
      break;
    case "number":
    case "integer":
      zodType = z.number();
      break;
    case "boolean":
      zodType = z.boolean();
      break;
    case "array":
      if (!items) {
        throw new Error("Invalid JSON schema: array type requires 'items'.");
      }
      zodType = z.array(convertJsonSchemaToZod(items));
      break;
    case "object":
      if (!properties) {
        zodType = z.object({});
      } else {
        const shape: Record<string, z.ZodType<any>> = {};
        for (const key in properties) {
          if (Object.prototype.hasOwnProperty.call(properties, key)) {
            shape[key] = convertJsonSchemaToZod(properties[key]);
          }
        }
        zodType = z.object(shape);
      }
      break;
    default:
      throw new Error(`Unsupported JSON schema type: ${type}`);
  }

  if (description) {
    zodType = zodType.describe(description);
  }

  return zodType;
}
