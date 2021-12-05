declare global {
  interface FetchedUserType {
    _id: string;
    fName: string;
    lName: string;
  }

  interface UserType extends FetchedUserType {
    email: string;
  }
}

export {};
