import { Maybe, Scalars, Distance, Mass, Volume, Force } from './common';

export type Dragon = {
  __typename?: 'Dragon';
  active?: Maybe<Scalars['Boolean']['output']>;
  crew_capacity?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  diameter?: Maybe<Distance>;
  dry_mass_kg?: Maybe<Scalars['Int']['output']>;
  dry_mass_lb?: Maybe<Scalars['Int']['output']>;
  first_flight?: Maybe<Scalars['String']['output']>;
  heat_shield?: Maybe<DragonHeatShield>;
  height_w_trunk?: Maybe<Distance>;
  id?: Maybe<Scalars['ID']['output']>;
  launch_payload_mass?: Maybe<Mass>;
  launch_payload_vol?: Maybe<Volume>;
  name?: Maybe<Scalars['String']['output']>;
  orbit_duration_yr?: Maybe<Scalars['Int']['output']>;
  pressurized_capsule?: Maybe<DragonPressurizedCapsule>;
  return_payload_mass?: Maybe<Mass>;
  return_payload_vol?: Maybe<Volume>;
  sidewall_angle_deg?: Maybe<Scalars['Float']['output']>;
  thrusters?: Maybe<Array<Maybe<DragonThrust>>>;
  trunk?: Maybe<DragonTrunk>;
  type?: Maybe<Scalars['String']['output']>;
  wikipedia?: Maybe<Scalars['String']['output']>;
};

export type DragonHeatShield = {
  __typename?: 'DragonHeatShield';
  dev_partner?: Maybe<Scalars['String']['output']>;
  material?: Maybe<Scalars['String']['output']>;
  size_meters?: Maybe<Scalars['Float']['output']>;
  temp_degrees?: Maybe<Scalars['Int']['output']>;
};

export type DragonPressurizedCapsule = {
  __typename?: 'DragonPressurizedCapsule';
  payload_volume?: Maybe<Volume>;
};

export type DragonThrust = {
  __typename?: 'DragonThrust';
  amount?: Maybe<Scalars['Int']['output']>;
  fuel_1?: Maybe<Scalars['String']['output']>;
  fuel_2?: Maybe<Scalars['String']['output']>;
  pods?: Maybe<Scalars['Int']['output']>;
  thrust?: Maybe<Force>;
  type?: Maybe<Scalars['String']['output']>;
};

export type DragonTrunk = {
  __typename?: 'DragonTrunk';
  cargo?: Maybe<DragonTrunkCargo>;
  trunk_volume?: Maybe<Volume>;
};

export type DragonTrunkCargo = {
  __typename?: 'DragonTrunkCargo';
  solar_array?: Maybe<Scalars['Int']['output']>;
  unpressurized_cargo?: Maybe<Scalars['Boolean']['output']>;
};