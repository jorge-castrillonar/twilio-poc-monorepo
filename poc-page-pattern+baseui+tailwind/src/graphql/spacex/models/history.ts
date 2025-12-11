import { Maybe, Scalars, InputMaybe, Result } from './common';
import { Launch } from './launch';

export type History = {
  __typename?: 'History';
  details?: Maybe<Scalars['String']['output']>;
  event_date_unix?: Maybe<Scalars['Date']['output']>;
  event_date_utc?: Maybe<Scalars['Date']['output']>;
  flight?: Maybe<Launch>;
  id?: Maybe<Scalars['ID']['output']>;
  links?: Maybe<Link>;
  title?: Maybe<Scalars['String']['output']>;
};

export type Link = {
  __typename?: 'Link';
  article?: Maybe<Scalars['String']['output']>;
  reddit?: Maybe<Scalars['String']['output']>;
  wikipedia?: Maybe<Scalars['String']['output']>;
};

export type HistoryFind = {
  end?: InputMaybe<Scalars['Date']['input']>;
  flight_number?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  start?: InputMaybe<Scalars['Date']['input']>;
};

export type HistoriesResult = {
  __typename?: 'HistoriesResult';
  data?: Maybe<Array<Maybe<History>>>;
  result?: Maybe<Result>;
};