export type AuthUser = {
  email: string;
  _id?: string;
  id?: string; // Roble sometimes uses 'id' instead of '_id'
  password?: string;
  name?: string;
};
