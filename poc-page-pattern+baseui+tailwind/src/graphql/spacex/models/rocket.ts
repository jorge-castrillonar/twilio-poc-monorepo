import { Maybe, Scalars, Distance, Mass, Force, Result } from './common';

export type Rocket = {
  __typename?: 'Rocket';
  active?: Maybe<Scalars['Boolean']['output']>;
  boosters?: Maybe<Scalars['Int']['output']>;
  company?: Maybe<Scalars['String']['output']>;
  cost_per_launch?: Maybe<Scalars['Int']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  diameter?: Maybe<Distance>;
  engines?: Maybe<RocketEngines>;
  first_flight?: Maybe<Scalars['Date']['output']>;
  first_stage?: Maybe<RocketFirstStage>;
  height?: Maybe<Distance>;
  id?: Maybe<Scalars['ID']['output']>;
  landing_legs?: Maybe<RocketLandingLegs>;
  mass?: Maybe<Mass>;
  name?: Maybe<Scalars['String']['output']>;
  payload_weights?: Maybe<Array<Maybe<RocketPayloadWeight>>>;
  second_stage?: Maybe<RocketSecondStage>;
  stages?: Maybe<Scalars['Int']['output']>;
  success_rate_pct?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  wikipedia?: Maybe<Scalars['String']['output']>;
};

export type RocketEngines = {
  __typename?: 'RocketEngines';
  engine_loss_max?: Maybe<Scalars['String']['output']>;
  layout?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['Int']['output']>;
  propellant_1?: Maybe<Scalars['String']['output']>;
  propellant_2?: Maybe<Scalars['String']['output']>;
  thrust_sea_level?: Maybe<Force>;
  thrust_to_weight?: Maybe<Scalars['Float']['output']>;
  thrust_vacuum?: Maybe<Force>;
  type?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

export type RocketFirstStage = {
  __typename?: 'RocketFirstStage';
  burn_time_sec?: Maybe<Scalars['Int']['output']>;
  engines?: Maybe<Scalars['Int']['output']>;
  fuel_amount_tons?: Maybe<Scalars['Float']['output']>;
  reusable?: Maybe<Scalars['Boolean']['output']>;
  thrust_sea_level?: Maybe<Force>;
  thrust_vacuum?: Maybe<Force>;
};

export type RocketSecondStage = {
  __typename?: 'RocketSecondStage';
  burn_time_sec?: Maybe<Scalars['Int']['output']>;
  engines?: Maybe<Scalars['Int']['output']>;
  fuel_amount_tons?: Maybe<Scalars['Float']['output']>;
  payloads?: Maybe<RocketSecondStagePayloads>;
  thrust?: Maybe<Force>;
};

export type RocketSecondStagePayloads = {
  __typename?: 'RocketSecondStagePayloads';
  composite_fairing?: Maybe<RocketSecondStagePayloadCompositeFairing>;
  option_1?: Maybe<Scalars['String']['output']>;
};

export type RocketSecondStagePayloadCompositeFairing = {
  __typename?: 'RocketSecondStagePayloadCompositeFairing';
  diameter?: Maybe<Distance>;
  height?: Maybe<Distance>;
};

export type RocketLandingLegs = {
  __typename?: 'RocketLandingLegs';
  material?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['Int']['output']>;
};

export type RocketPayloadWeight = {
  __typename?: 'RocketPayloadWeight';
  id?: Maybe<Scalars['String']['output']>;
  kg?: Maybe<Scalars['Int']['output']>;
  lb?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type RocketsResult = {
  __typename?: 'RocketsResult';
  data?: Maybe<Array<Maybe<Rocket>>>;
  result?: Maybe<Result>;
};