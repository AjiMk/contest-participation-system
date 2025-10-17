declare module 'bcryptjs' {
  /**
   * Synchronous salt generation
   */
  export function genSaltSync(rounds?: number): string;

  /**
   * Asynchronous salt generation
   */
  export function genSalt(rounds?: number): Promise<string>;

  /**
   * Synchronous hash
   */
  export function hashSync(s: string, saltOrRounds: string | number): string;

  /**
   * Asynchronous hash
   */
  export function hash(s: string, saltOrRounds: string | number): Promise<string>;

  /**
   * Synchronous compare
   */
  export function compareSync(s: string, hash: string): boolean;

  /**
   * Asynchronous compare
   */
  export function compare(s: string, hash: string): Promise<boolean>;

  const bcrypt: {
    genSaltSync: typeof genSaltSync;
    genSalt: typeof genSalt;
    hashSync: typeof hashSync;
    hash: typeof hash;
    compareSync: typeof compareSync;
    compare: typeof compare;
  };

  export default bcrypt;
}
