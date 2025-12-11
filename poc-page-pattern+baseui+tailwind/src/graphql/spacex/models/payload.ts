import { Maybe, Scalars, InputMaybe } from './common';

export type Payload = {
  __typename?: 'Payload';
  customers?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id?: Maybe<Scalars['ID']['output']>;
  manufacturer?: Maybe<Scalars['String']['output']>;
  nationality?: Maybe<Scalars['String']['output']>;
  norad_id?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  orbit?: Maybe<Scalars['String']['output']>;
  orbit_params?: Maybe<PayloadOrbitParams>;
  payload_mass_kg?: Maybe<Scalars['Float']['output']>;
  payload_mass_lbs?: Maybe<Scalars['Float']['output']>;
  payload_type?: Maybe<Scalars['String']['output']>;
  reused?: Maybe<Scalars['Boolean']['output']>;
};

export type PayloadOrbitParams = {
  __typename?: 'PayloadOrbitParams';
  apoapsis_km?: Maybe<Scalars['Float']['output']>;
  arg_of_pericenter?: Maybe<Scalars['Float']['output']>;
  eccentricity?: Maybe<Scalars['Float']['output']>;
  epoch?: Maybe<Scalars['Date']['output']>;
  inclination_deg?: Maybe<Scalars['Float']['output']>;
  lifespan_years?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  mean_anomaly?: Maybe<Scalars['Float']['output']>;
  mean_motion?: Maybe<Scalars['Float']['output']>;
  periapsis_km?: Maybe<Scalars['Float']['output']>;
  period_min?: Maybe<Scalars['Float']['output']>;
  raan?: Maybe<Scalars['Float']['output']>;
  reference_system?: Maybe<Scalars['String']['output']>;
  regime?: Maybe<Scalars['String']['output']>;
  semi_major_axis_km?: Maybe<Scalars['Float']['output']>;
};

export type PayloadsFind = {
  apoapsis_km?: InputMaybe<Scalars['Float']['input']>;
  customer?: InputMaybe<Scalars['String']['input']>;
  eccentricity?: InputMaybe<Scalars['Float']['input']>;
  epoch?: InputMaybe<Scalars['Date']['input']>;
  inclination_deg?: InputMaybe<Scalars['Float']['input']>;
  lifespan_years?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  mean_motion?: InputMaybe<Scalars['Float']['input']>;
  nationality?: InputMaybe<Scalars['String']['input']>;
  norad_id?: InputMaybe<Scalars['Int']['input']>;
  orbit?: InputMaybe<Scalars['String']['input']>;
  payload_id?: InputMaybe<Scalars['ID']['input']>;
  payload_type?: InputMaybe<Scalars['String']['input']>;
  periapsis_km?: InputMaybe<Scalars['Float']['input']>;
  period_min?: InputMaybe<Scalars['Float']['input']>;
  raan?: InputMaybe<Scalars['Float']['input']>;
  reference_system?: InputMaybe<Scalars['String']['input']>;
  regime?: InputMaybe<Scalars['String']['input']>;
  reused?: InputMaybe<Scalars['Boolean']['input']>;
  semi_major_axis_km?: InputMaybe<Scalars['Float']['input']>;
};