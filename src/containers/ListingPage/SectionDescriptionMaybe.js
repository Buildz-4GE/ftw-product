import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { richText } from '../../util/richText';
import HtmlDecode from './HtmlDecode';

import css from './ListingPage.module.css';

const MIN_LENGTH_FOR_LONG_WORDS_IN_DESCRIPTION = 20;

const SectionDescriptionMaybe = props => {
  const { description, listingTitle } = props;
  return description ? (
    <div className={css.sectionDescription}>
      <h2 className={css.descriptionTitle}>
        <FormattedMessage id="ListingPage.descriptionTitle" values={{ listingTitle }} />
      </h2>
      <HtmlDecode
          htmlString={description}
      />
    </div>
  ) : null;
};

export default SectionDescriptionMaybe;
