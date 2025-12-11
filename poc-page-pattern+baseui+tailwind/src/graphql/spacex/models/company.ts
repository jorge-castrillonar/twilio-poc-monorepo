import { Maybe, Scalars, Address } from './common';

export type Info = {
  __typename?: 'Info';
  ceo?: Maybe<Scalars['String']['output']>;
  coo?: Maybe<Scalars['String']['output']>;
  cto?: Maybe<Scalars['String']['output']>;
  cto_propulsion?: Maybe<Scalars['String']['output']>;
  employees?: Maybe<Scalars['Int']['output']>;
  founded?: Maybe<Scalars['Int']['output']>;
  founder?: Maybe<Scalars['String']['output']>;
  headquarters?: Maybe<Address>;
  launch_sites?: Maybe<Scalars['Int']['output']>;
  links?: Maybe<InfoLinks>;
  name?: Maybe<Scalars['String']['output']>;
  summary?: Maybe<Scalars['String']['output']>;
  test_sites?: Maybe<Scalars['Int']['output']>;
  valuation?: Maybe<Scalars['Float']['output']>;
  vehicles?: Maybe<Scalars['Int']['output']>;
};

export type InfoLinks = {
  __typename?: 'InfoLinks';
  elon_twitter?: Maybe<Scalars['String']['output']>;
  flickr?: Maybe<Scalars['String']['output']>;
  twitter?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};