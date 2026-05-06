import { Role } from "../../generated/enums";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}

export { };