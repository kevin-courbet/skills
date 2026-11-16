// The errors that stop a command. The CLI maps each one to an exit status: a
// usage error and a kit error to 2, and a lookup miss to 1, so that a script
// can tell a wrong call from an id that does not exist.
export class UsageError extends Error {}

export class LookupError extends Error {}
