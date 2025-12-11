import { Maybe, Scalars, InputMaybe } from './common';
import { Dragon } from './dragon';

export type Capsule = {
  __typename?: 'Capsule';
  /** @deprecated This is not available in the REST API after MongoDB has been deprecated */
  dragon?: Maybe<Dragon>;
  id?: Maybe<Scalars['ID']['output']>;
  landings?: Maybe<Scalars['Int']['output']>;
  missions?: Maybe<Array<Maybe<CapsuleMission>>>;
  original_launch?: Maybe<Scalars['Date']['output']>;
  reuse_count?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type CapsuleMission = {
  __typename?: 'CapsuleMission';
  flight?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type CapsulesFind = {
  id?: InputMaybe<Scalars['ID']['input']>;
  landings?: InputMaybe<Scalars['Int']['input']>;
  mission?: InputMaybe<Scalars['String']['input']>;
  original_launch?: InputMaybe<Scalars['Date']['input']>;
  reuse_count?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};