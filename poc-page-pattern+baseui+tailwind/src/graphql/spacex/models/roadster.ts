import { Maybe, Scalars } from './common';

export type Roadster = {
  __typename?: 'Roadster';
  apoapsis_au?: Maybe<Scalars['Float']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  earth_distance_km?: Maybe<Scalars['Float']['output']>;
  earth_distance_mi?: Maybe<Scalars['Float']['output']>;
  eccentricity?: Maybe<Scalars['Float']['output']>;
  epoch_jd?: Maybe<Scalars['Float']['output']>;
  inclination?: Maybe<Scalars['Float']['output']>;
  launch_date_unix?: Maybe<Scalars['Date']['output']>;
  launch_date_utc?: Maybe<Scalars['Date']['output']>;
  launch_mass_kg?: Maybe<Scalars['Int']['output']>;
  launch_mass_lbs?: Maybe<Scalars['Int']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  mars_distance_km?: Maybe<Scalars['Float']['output']>;
  mars_distance_mi?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  norad_id?: Maybe<Scalars['Int']['output']>;
  orbit_type?: Maybe<Scalars['Float']['output']>;
  periapsis_arg?: Maybe<Scalars['Float']['output']>;
  periapsis_au?: Maybe<Scalars['Float']['output']>;
  period_days?: Maybe<Scalars['Float']['output']>;
  semi_major_axis_au?: Maybe<Scalars['Float']['output']>;
  speed_kph?: Maybe<Scalars['Float']['output']>;
  speed_mph?: Maybe<Scalars['Float']['output']>;
  wikipedia?: Maybe<Scalars['String']['output']>;
};