export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: string; output: string; }
  ObjectID: { input: string; output: string; }
  timestamptz: { input: string; output: string; }
  uuid: { input: string; output: string; }
};

export type Distance = {
  __typename?: 'Distance';
  feet?: Maybe<Scalars['Float']['output']>;
  meters?: Maybe<Scalars['Float']['output']>;
};

export type Mass = {
  __typename?: 'Mass';
  kg?: Maybe<Scalars['Int']['output']>;
  lb?: Maybe<Scalars['Int']['output']>;
};

export type Force = {
  __typename?: 'Force';
  kN?: Maybe<Scalars['Float']['output']>;
  lbf?: Maybe<Scalars['Float']['output']>;
};

export type Volume = {
  __typename?: 'Volume';
  cubic_feet?: Maybe<Scalars['Int']['output']>;
  cubic_meters?: Maybe<Scalars['Int']['output']>;
};

export type Address = {
  __typename?: 'Address';
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
};

export type Location = {
  __typename?: 'Location';
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
};

export type Result = {
  __typename?: 'Result';
  totalCount?: Maybe<Scalars['Int']['output']>;
};