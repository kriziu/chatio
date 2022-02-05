export declare global {
  interface FetchedUserType {
    _id: string;
    fName: string;
    lName: string;
    imageURL: string;
  }

  interface UserType extends FetchedUserType {
    email: string;
  }

  interface UserInvited extends UserType {
    inviteDate: Date;
    inviteId: string;
  }

  interface InviteType {
    _id: string;
    from: string;
    to: string;
    date: Date;
  }

  interface CConnectionType {
    _id: string;
    imageURL?: string;
    name?: string;
    admins?: UserType[];
    users: UserType[];
    group: boolean;
    blocked: {
      by: string | null;
      yes: boolean;
    };
  }

  interface MessageType {
    administrate?: boolean;
    sender: UserType;
    message: string;
    connectionId: string;
    date: Date;
    read: UserType[];
    pin: boolean;
    _id: string;
    deleted: boolean;
  }
}
