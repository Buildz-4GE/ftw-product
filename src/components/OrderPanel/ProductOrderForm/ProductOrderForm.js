import React from 'react';
import { bool, func, number, string } from 'prop-types';
import { Form as FinalForm, FormSpy } from 'react-final-form';

import config from '../../../config';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import {
  Form,
  FieldSelect,
  FieldTextInput,
  InlineTextButton,
  PrimaryButton,
} from '../../../components';

import EstimatedCustomerBreakdownMaybe from '../EstimatedCustomerBreakdownMaybe';

import css from './ProductOrderForm.module.css';

const renderForm = formRenderProps => {
  const {
    // FormRenderProps from final-form
    handleSubmit,
    invalid,

    // Custom props passed to the form component
    intl,
    formId,
    currentStock,
    hasMultipleDeliveryMethods,
    listingId,
    isOwnListing,
    onFetchTransactionLineItems,
    onContactUser,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    values,
  } = formRenderProps;

  const handleOnChange = formValues => {
    const { quantity: quantityRaw, deliveryMethod } = formValues.values;
    const quantity = Number.parseInt(quantityRaw, 10);
    if (quantity && deliveryMethod && !fetchLineItemsInProgress) {
      onFetchTransactionLineItems({
        orderData: { quantity, deliveryMethod },
        listingId,
        isOwnListing,
      });
    }
  };

  const breakdownData = {};
  const showBreakdown =
    breakdownData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;
  const breakdown = showBreakdown ? (
    <div className={css.breakdownWrapper}>
      <h3>
        <FormattedMessage id="ProductOrderForm.breakdownTitle" />
      </h3>
      <EstimatedCustomerBreakdownMaybe
        unitType={config.lineItemUnitType}
        breakdownData={breakdownData}
        lineItems={lineItems}
      />
    </div>
  ) : null;

  const showContactUser = typeof onContactUser === 'function';

  const onClickContactUser = e => {
    e.preventDefault();
    onContactUser();
  };

  const contactSellerLink = (
    <InlineTextButton onClick={onClickContactUser}>
      <FormattedMessage id="ProductOrderForm.finePrintNoStockLinkText" />
    </InlineTextButton>
  );

  const hasStock = currentStock && currentStock > 0;
  const quantities = hasStock ? [...Array(currentStock).keys()].map(i => i + 1) : [];
  const hasOneItemLeft = currentStock && currentStock === 1;

  const submitInProgress = fetchLineItemsInProgress;
  const submitDisabled = invalid || !hasStock;

  return (
    <Form onSubmit={handleSubmit}>
      <FormSpy subscription={{ values: true }} onChange={handleOnChange} />
      {hasOneItemLeft ? (
        <FieldTextInput
          id={`${formId}.quantity`}
          className={css.quantityField}
          name="quantity"
          type="hidden"
          value="1"
        />
      ) : (
        <FieldSelect
          id={`${formId}.quantity`}
          className={css.quantityField}
          name="quantity"
          disabled={!hasStock}
          label={intl.formatMessage({ id: 'ProductOrderForm.quantityLabel' })}
        >
          <option disabled value="">
            {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
          </option>
          {quantities.map(quantity => (
            <option key={quantity} value={quantity}>
              {intl.formatMessage({ id: 'ProductOrderForm.quantityOption' }, { quantity })}
            </option>
          ))}
        </FieldSelect>
      )}

      {hasMultipleDeliveryMethods ? (
        <FieldSelect
          id={`${formId}.deliveryMethod`}
          className={css.deliveryField}
          name="deliveryMethod"
          disabled={!hasStock}
          label={intl.formatMessage({ id: 'ProductOrderForm.deliveryMethodLabel' })}
        >
          <option disabled value="">
            {intl.formatMessage({ id: 'ProductOrderForm.selectDeliveryMethodOption' })}
          </option>
          <option value={'pickup'}>
            {intl.formatMessage({ id: 'ProductOrderForm.pickupOption' })}
          </option>
          <option value={'shipping'}>
            {intl.formatMessage({ id: 'ProductOrderForm.shippingOption' })}
          </option>
        </FieldSelect>
      ) : (
        <div className={css.deliveryField}>
          <label>{intl.formatMessage({ id: 'ProductOrderForm.deliveryMethodLabel' })}</label>
          <p className={css.singleDeliveryMethodSelected}>
            {values.deliveryMethod === 'shipping'
              ? intl.formatMessage({ id: 'ProductOrderForm.shippingOption' })
              : intl.formatMessage({ id: 'ProductOrderForm.pickupOption' })}
          </p>
          <FieldTextInput
            id={`${formId}.deliveryMethod`}
            className={css.deliveryField}
            name="deliveryMethod"
            type="hidden"
          />
        </div>
      )}
      {breakdown}
      <div className={css.submitButton}>
        <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
          {hasStock ? (
            <FormattedMessage id="ProductOrderForm.ctaButton" />
          ) : (
            <FormattedMessage id="ProductOrderForm.ctaButtonNoStock" />
          )}
        </PrimaryButton>
      </div>
      <p className={css.finePrint}>
        {hasStock ? (
          <FormattedMessage id="ProductOrderForm.finePrint" />
        ) : showContactUser ? (
          <FormattedMessage id="ProductOrderForm.finePrintNoStock" values={{ contactSellerLink }} />
        ) : null}
      </p>
    </Form>
  );
};

const ProductOrderForm = props => {
  const intl = useIntl();
  const { price, currentStock, pickupEnabled, shippingEnabled } = props;

  // Should not happen for listings that go through EditListingWizard.
  // However, this might happen for imported listings.
  if (!pickupEnabled && !shippingEnabled) {
    <p className={css.error}>
      <FormattedMessage id="ProductOrderForm.noDeliveryMethodSet" />
    </p>;
  }

  if (!price) {
    return (
      <p className={css.error}>
        <FormattedMessage id="ProductOrderForm.listingPriceMissing" />
      </p>
    );
  }
  if (price.currency !== config.currency) {
    return (
      <p className={css.error}>
        <FormattedMessage id="ProductOrderForm.listingCurrencyInvalid" />
      </p>
    );
  }
  const hasOneItemLeft = currentStock && currentStock === 1;
  const quantityMaybe = hasOneItemLeft ? { quantity: '1' } : {};
  const singleDeliveryMethodAvailableMaybe =
    shippingEnabled && !pickupEnabled
      ? { deliveryMethod: 'shipping' }
      : !shippingEnabled && pickupEnabled
      ? { deliveryMethod: 'pickup' }
      : {};
  const hasMultipleDeliveryMethods = pickupEnabled && shippingEnabled;
  const initialValues = { ...quantityMaybe, ...singleDeliveryMethodAvailableMaybe };

  return (
    <FinalForm
      initialValues={initialValues}
      hasMultipleDeliveryMethods={hasMultipleDeliveryMethods}
      {...props}
      intl={intl}
      render={renderForm}
    />
  );
};

ProductOrderForm.defaultProps = {
  rootClassName: null,
  className: null,
  price: null,
  currentStock: null,
  listingId: null,
  isOwnListing: false,
  lineItems: null,
  fetchLineItemsError: null,
};

ProductOrderForm.propTypes = {
  rootClassName: string,
  className: string,

  // form
  formId: string.isRequired,
  onSubmit: func.isRequired,

  // listing
  listingId: propTypes.uuid,
  price: propTypes.money,
  currentStock: number,
  isOwnListing: bool,

  // line items
  lineItems: propTypes.lineItems,
  onFetchTransactionLineItems: func.isRequired,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // other
  onContactUser: func,
};

export default ProductOrderForm;
