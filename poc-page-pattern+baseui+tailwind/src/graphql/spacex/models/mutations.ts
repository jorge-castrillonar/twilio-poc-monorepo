import { InputMaybe } from './common';
import { Users_Bool_Exp, Users_Insert_Input, Users_On_Conflict, Users_Set_Input, Users_Mutation_Response } from './users';

export type Mutation = {
  __typename?: 'Mutation';
  delete_users?: Maybe<Users_Mutation_Response>;
  insert_users?: Maybe<Users_Mutation_Response>;
  update_users?: Maybe<Users_Mutation_Response>;
};

export type MutationDelete_UsersArgs = {
  where: Users_Bool_Exp;
};

export type MutationInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

export type MutationUpdate_UsersArgs = {
  _set?: InputMaybe<Users_Set_Input>;
  where: Users_Bool_Exp;
};

type Maybe<T> = T | null;
