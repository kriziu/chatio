declare global {
  interface FetchedUserType {
    _id: string;
    fName: string;
    lName: string;
    imageURL: string;
  }

  interface UserType extends FetchedUserType {
    email: string;
  }

  interface InviteType {
    _id: string;
    from: string;
    to: string;
    date: Date;
  }

  interface CConnectionType {
    _id: string;
    users: UserType[];
    group: boolean;
    blocked: {
      by: string | null;
      yes: boolean;
    };
  }

  interface MessageType {
    sender: UserType;
    message: string;
    connectionId: string;
    date: Date;
    read: boolean;
    pin: boolean;
    _id: string;
    deleted: boolean;
  }
}

export {};
