import { Maybe, Scalars, Location } from './common';
import { Rocket } from './rocket';

export type Launchpad = {
  __typename?: 'Launchpad';
  attempted_launches?: Maybe<Scalars['Int']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  location?: Maybe<Location>;
  name?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  successful_launches?: Maybe<Scalars['Int']['output']>;
  vehicles_launched?: Maybe<Array<Maybe<Rocket>>>;
  wikipedia?: Maybe<Scalars['String']['output']>;
};

export type Landpad = {
  __typename?: 'Landpad';
  attempted_landings?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  full_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  landing_type?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Location>;
  status?: Maybe<Scalars['String']['output']>;
  successful_landings?: Maybe<Scalars['String']['output']>;
  wikipedia?: Maybe<Scalars['String']['output']>;
};