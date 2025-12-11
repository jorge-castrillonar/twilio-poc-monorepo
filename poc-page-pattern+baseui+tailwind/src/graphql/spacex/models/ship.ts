import { Maybe, Scalars, InputMaybe, Result } from './common';

export type Ship = {
  __typename?: 'Ship';
  abs?: Maybe<Scalars['Int']['output']>;
  active?: Maybe<Scalars['Boolean']['output']>;
  attempted_landings?: Maybe<Scalars['Int']['output']>;
  class?: Maybe<Scalars['Int']['output']>;
  course_deg?: Maybe<Scalars['Int']['output']>;
  home_port?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  imo?: Maybe<Scalars['Int']['output']>;
  missions?: Maybe<Array<Maybe<ShipMission>>>;
  mmsi?: Maybe<Scalars['Int']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position?: Maybe<ShipLocation>;
  roles?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  speed_kn?: Maybe<Scalars['Float']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  successful_landings?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  weight_kg?: Maybe<Scalars['Int']['output']>;
  weight_lbs?: Maybe<Scalars['Int']['output']>;
  year_built?: Maybe<Scalars['Int']['output']>;
};

export type ShipLocation = {
  __typename?: 'ShipLocation';
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
};

export type ShipMission = {
  __typename?: 'ShipMission';
  flight?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type ShipsFind = {
  abs?: InputMaybe<Scalars['Int']['input']>;
  active?: InputMaybe<Scalars['Boolean']['input']>;
  attempted_landings?: InputMaybe<Scalars['Int']['input']>;
  class?: InputMaybe<Scalars['Int']['input']>;
  course_deg?: InputMaybe<Scalars['Int']['input']>;
  home_port?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  imo?: InputMaybe<Scalars['Int']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  mission?: InputMaybe<Scalars['String']['input']>;
  mmsi?: InputMaybe<Scalars['Int']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  speed_kn?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  successful_landings?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  weight_kg?: InputMaybe<Scalars['Int']['input']>;
  weight_lbs?: InputMaybe<Scalars['Int']['input']>;
  year_built?: InputMaybe<Scalars['Int']['input']>;
};

export type ShipsResult = {
  __typename?: 'ShipsResult';
  data?: Maybe<Array<Maybe<Ship>>>;
  result?: Maybe<Result>;
};