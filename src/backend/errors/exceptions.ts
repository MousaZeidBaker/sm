export class NotFoundException extends Error {
  name: string;

  constructor() {
    super();
    this.name = "NotFoundException";

    // Needed for extending built-ins
    // See: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}
