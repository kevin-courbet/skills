import { Schema } from "effect";

/**
 * Failures that cross the server-function boundary. Schema-backed classes
 * serialize with their fields, so the client can branch on _tag.
 * Internal errors stay in src/server and are mapped to one of these.
 */
export class NotFoundError extends Schema.TaggedError<NotFoundError>()("NotFoundError", {
  entity: Schema.String,
  id: Schema.String,
}) {}

export class ConflictError extends Schema.TaggedError<ConflictError>()("ConflictError", {
  message: Schema.String,
}) {}

export class ValidationError extends Schema.TaggedError<ValidationError>()("ValidationError", {
  message: Schema.String,
  field: Schema.optional(Schema.String),
}) {}

export class ForbiddenError extends Schema.TaggedError<ForbiddenError>()("ForbiddenError", {
  message: Schema.String,
}) {}

export const WireError = Schema.Union([
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
]);
export type WireError = typeof WireError.Type;
export type WireErrorEncoded = typeof WireError.Encoded;
export const isWireError = Schema.is(WireError);
