import { Maybe, Scalars, InputMaybe, Result } from './common';
import { Payload } from './payload';

export type Mission = {
  __typename?: 'Mission';
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  manufacturers?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  name?: Maybe<Scalars['String']['output']>;
  payloads?: Maybe<Array<Maybe<Payload>>>;
  twitter?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
  wikipedia?: Maybe<Scalars['String']['output']>;
};

export type MissionResult = {
  __typename?: 'MissionResult';
  data?: Maybe<Array<Maybe<Mission>>>;
  result?: Maybe<Result>;
};

export type MissionsFind = {
  id?: InputMaybe<Scalars['ID']['input']>;
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  payload_id?: InputMaybe<Scalars['String']['input']>;
};