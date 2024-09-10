import { Type, type Static, type TObject, type TProperties } from "@sinclair/typebox";
import { ErrorCode } from "../const.js";
import { Value } from "@sinclair/typebox/value";

export const ErrorSchema = Type.Object({
  code: Type.Enum(ErrorCode),
  name: Type.String(),
  message: Type.String(),
  statusCode: Type.Number(),
});

export type Error = Static<typeof ErrorSchema>;

export const ResponseErrorSchema = Type.Object({
  error: ErrorSchema,
});

export type ResponseError = Static<typeof ResponseErrorSchema>;

export function getReplySchemaWithError<T extends TProperties>(schemaObject: TObject<T>) {
  return Type.Union([schemaObject, ResponseErrorSchema]);
}

export function hasErrorSchema(schema: unknown): schema is Error {
  return Value.Check(ErrorSchema, schema);
}
