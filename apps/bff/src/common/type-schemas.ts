import { Type, type Static, type TObject, type TProperties } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const ErrorPropertiesSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
  name: Type.String(),
  statusCode: Type.Number(),
});

export const ErrorSchema = Type.Object({
  error: ErrorPropertiesSchema,
});

export function getSchemaWithError<T extends TProperties>(schemaObject: TObject<T>) {
  return Type.Union([schemaObject, ErrorSchema]);
}

export function hasErrorSchema(schema: unknown): schema is Static<typeof ErrorPropertiesSchema> {
  return Value.Check(ErrorPropertiesSchema, schema);
}
