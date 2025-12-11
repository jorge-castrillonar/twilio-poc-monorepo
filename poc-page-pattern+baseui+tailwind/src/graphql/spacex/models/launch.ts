import { Maybe, Scalars, InputMaybe } from './common';
import { Rocket } from './rocket';
import { Ship } from './ship';

export type Launch = {
  __typename?: 'Launch';
  details?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  is_tentative?: Maybe<Scalars['Boolean']['output']>;
  launch_date_local?: Maybe<Scalars['Date']['output']>;
  launch_date_unix?: Maybe<Scalars['Date']['output']>;
  launch_date_utc?: Maybe<Scalars['Date']['output']>;
  launch_site?: Maybe<LaunchSite>;
  launch_success?: Maybe<Scalars['Boolean']['output']>;
  launch_year?: Maybe<Scalars['String']['output']>;
  links?: Maybe<LaunchLinks>;
  mission_id?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  mission_name?: Maybe<Scalars['String']['output']>;
  rocket?: Maybe<LaunchRocket>;
  ships?: Maybe<Array<Maybe<Ship>>>;
  static_fire_date_unix?: Maybe<Scalars['Date']['output']>;
  static_fire_date_utc?: Maybe<Scalars['Date']['output']>;
  telemetry?: Maybe<LaunchTelemetry>;
  tentative_max_precision?: Maybe<Scalars['String']['output']>;
  upcoming?: Maybe<Scalars['Boolean']['output']>;
};

export type LaunchSite = {
  __typename?: 'LaunchSite';
  site_id?: Maybe<Scalars['String']['output']>;
  site_name?: Maybe<Scalars['String']['output']>;
  site_name_long?: Maybe<Scalars['String']['output']>;
};

export type LaunchLinks = {
  __typename?: 'LaunchLinks';
  article_link?: Maybe<Scalars['String']['output']>;
  flickr_images?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  mission_patch?: Maybe<Scalars['String']['output']>;
  mission_patch_small?: Maybe<Scalars['String']['output']>;
  presskit?: Maybe<Scalars['String']['output']>;
  reddit_campaign?: Maybe<Scalars['String']['output']>;
  reddit_launch?: Maybe<Scalars['String']['output']>;
  reddit_media?: Maybe<Scalars['String']['output']>;
  reddit_recovery?: Maybe<Scalars['String']['output']>;
  video_link?: Maybe<Scalars['String']['output']>;
  wikipedia?: Maybe<Scalars['String']['output']>;
};

export type LaunchRocket = {
  __typename?: 'LaunchRocket';
  fairings?: Maybe<LaunchRocketFairings>;
  first_stage?: Maybe<LaunchRocketFirstStage>;
  rocket?: Maybe<Rocket>;
  rocket_name?: Maybe<Scalars['String']['output']>;
  rocket_type?: Maybe<Scalars['String']['output']>;
  second_stage?: Maybe<LaunchRocketSecondStage>;
};

export type LaunchRocketFairings = {
  __typename?: 'LaunchRocketFairings';
  recovered?: Maybe<Scalars['Boolean']['output']>;
  recovery_attempt?: Maybe<Scalars['Boolean']['output']>;
  reused?: Maybe<Scalars['Boolean']['output']>;
  ship?: Maybe<Scalars['String']['output']>;
};

export type LaunchRocketFirstStage = {
  __typename?: 'LaunchRocketFirstStage';
  cores?: Maybe<Array<Maybe<LaunchRocketFirstStageCore>>>;
};

export type LaunchRocketFirstStageCore = {
  __typename?: 'LaunchRocketFirstStageCore';
  block?: Maybe<Scalars['Int']['output']>;
  core?: Maybe<any>; // Core type would be in separate file
  flight?: Maybe<Scalars['Int']['output']>;
  gridfins?: Maybe<Scalars['Boolean']['output']>;
  land_success?: Maybe<Scalars['Boolean']['output']>;
  landing_intent?: Maybe<Scalars['Boolean']['output']>;
  landing_type?: Maybe<Scalars['String']['output']>;
  landing_vehicle?: Maybe<Scalars['String']['output']>;
  legs?: Maybe<Scalars['Boolean']['output']>;
  reused?: Maybe<Scalars['Boolean']['output']>;
};

export type LaunchRocketSecondStage = {
  __typename?: 'LaunchRocketSecondStage';
  block?: Maybe<Scalars['Int']['output']>;
  payloads?: Maybe<Array<Maybe<any>>>; // Payload type would be in separate file
};

export type LaunchTelemetry = {
  __typename?: 'LaunchTelemetry';
  flight_club?: Maybe<Scalars['String']['output']>;
};

export type LaunchFind = {
  apoapsis_km?: InputMaybe<Scalars['Float']['input']>;
  block?: InputMaybe<Scalars['Int']['input']>;
  cap_serial?: InputMaybe<Scalars['String']['input']>;
  capsule_reuse?: InputMaybe<Scalars['String']['input']>;
  core_flight?: InputMaybe<Scalars['Int']['input']>;
  core_reuse?: InputMaybe<Scalars['String']['input']>;
  core_serial?: InputMaybe<Scalars['String']['input']>;
  customer?: InputMaybe<Scalars['String']['input']>;
  eccentricity?: InputMaybe<Scalars['Float']['input']>;
  end?: InputMaybe<Scalars['Date']['input']>;
  epoch?: InputMaybe<Scalars['Date']['input']>;
  fairings_recovered?: InputMaybe<Scalars['String']['input']>;
  fairings_recovery_attempt?: InputMaybe<Scalars['String']['input']>;
  fairings_reuse?: InputMaybe<Scalars['String']['input']>;
  fairings_reused?: InputMaybe<Scalars['String']['input']>;
  fairings_ship?: InputMaybe<Scalars['String']['input']>;
  gridfins?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  inclination_deg?: InputMaybe<Scalars['Float']['input']>;
  land_success?: InputMaybe<Scalars['String']['input']>;
  landing_intent?: InputMaybe<Scalars['String']['input']>;
  landing_type?: InputMaybe<Scalars['String']['input']>;
  landing_vehicle?: InputMaybe<Scalars['String']['input']>;
  launch_date_local?: InputMaybe<Scalars['Date']['input']>;
  launch_date_utc?: InputMaybe<Scalars['Date']['input']>;
  launch_success?: InputMaybe<Scalars['String']['input']>;
  launch_year?: InputMaybe<Scalars['String']['input']>;
  legs?: InputMaybe<Scalars['String']['input']>;
  lifespan_years?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  mean_motion?: InputMaybe<Scalars['Float']['input']>;
  mission_id?: InputMaybe<Scalars['String']['input']>;
  mission_name?: InputMaybe<Scalars['String']['input']>;
  nationality?: InputMaybe<Scalars['String']['input']>;
  norad_id?: InputMaybe<Scalars['Int']['input']>;
  orbit?: InputMaybe<Scalars['String']['input']>;
  payload_id?: InputMaybe<Scalars['String']['input']>;
  payload_type?: InputMaybe<Scalars['String']['input']>;
  periapsis_km?: InputMaybe<Scalars['Float']['input']>;
  period_min?: InputMaybe<Scalars['Float']['input']>;
  raan?: InputMaybe<Scalars['Float']['input']>;
  reference_system?: InputMaybe<Scalars['String']['input']>;
  regime?: InputMaybe<Scalars['String']['input']>;
  reused?: InputMaybe<Scalars['String']['input']>;
  rocket_id?: InputMaybe<Scalars['String']['input']>;
  rocket_name?: InputMaybe<Scalars['String']['input']>;
  rocket_type?: InputMaybe<Scalars['String']['input']>;
  second_stage_block?: InputMaybe<Scalars['String']['input']>;
  semi_major_axis_km?: InputMaybe<Scalars['Float']['input']>;
  ship?: InputMaybe<Scalars['String']['input']>;
  side_core1_reuse?: InputMaybe<Scalars['String']['input']>;
  side_core2_reuse?: InputMaybe<Scalars['String']['input']>;
  site_id?: InputMaybe<Scalars['String']['input']>;
  site_name?: InputMaybe<Scalars['String']['input']>;
  site_name_long?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Date']['input']>;
  tbd?: InputMaybe<Scalars['String']['input']>;
  tentative?: InputMaybe<Scalars['String']['input']>;
  tentative_max_precision?: InputMaybe<Scalars['String']['input']>;
};

export type LaunchesPastResult = {
  __typename?: 'LaunchesPastResult';
  data?: Maybe<Array<Maybe<Launch>>>;
  result?: Maybe<any>; // Result type from common
};