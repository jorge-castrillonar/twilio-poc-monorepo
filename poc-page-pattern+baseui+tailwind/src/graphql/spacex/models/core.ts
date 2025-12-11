import { Maybe, Scalars, InputMaybe } from './common';
import { CapsuleMission } from './capsule';

export type Core = {
  __typename?: 'Core';
  asds_attempts?: Maybe<Scalars['Int']['output']>;
  asds_landings?: Maybe<Scalars['Int']['output']>;
  block?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  missions?: Maybe<Array<Maybe<CapsuleMission>>>;
  original_launch?: Maybe<Scalars['Date']['output']>;
  reuse_count?: Maybe<Scalars['Int']['output']>;
  rtls_attempts?: Maybe<Scalars['Int']['output']>;
  rtls_landings?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  water_landing?: Maybe<Scalars['Boolean']['output']>;
};

export type CoreMission = {
  __typename?: 'CoreMission';
  flight?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type CoresFind = {
  asds_attempts?: InputMaybe<Scalars['Int']['input']>;
  asds_landings?: InputMaybe<Scalars['Int']['input']>;
  block?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  missions?: InputMaybe<Scalars['String']['input']>;
  original_launch?: InputMaybe<Scalars['Date']['input']>;
  reuse_count?: InputMaybe<Scalars['Int']['input']>;
  rtls_attempts?: InputMaybe<Scalars['Int']['input']>;
  rtls_landings?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  water_landing?: InputMaybe<Scalars['Boolean']['input']>;
};