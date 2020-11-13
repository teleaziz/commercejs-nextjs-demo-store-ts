import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import ccFormat from '../../utils/ccFormat';
import commerce from '../../lib/commerce';
import Root from '../../components/common/Root';
import {
  generateCheckoutTokenFromCart as dispatchGenerateCheckout,
  getShippingOptionsForCheckout as dispatchGetShippingOptions,
  setShippingOptionInCheckout as dispatchSetShippingOptionsInCheckout,
  setDiscountCodeInCheckout as dispatchSetDiscountCodeInCheckout,
  captureOrder as dispatchCaptureOrder,
} from '../../store/actions/checkoutActions';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { BuilderComponent, builder, Builder } from '@builder.io/react';

import Loader from '../../components/checkout/Loader';

import '../../components/checkout/CheckoutDetails.builder';

builder.init(process.env.BUILDER_API_KEY);


class CheckoutPage extends Component {
  constructor(props) {
    super(props);
    this.state = {

      deliveryCountry: 'CA',
      deliveryRegion: 'BC',

      // string property names to conveniently identify inputs related to commerce.js validation errors
      // e.g error { param: "shipping[name]"}
      firstName: 'John',
      lastName: 'Doe',
      'customer[email]': 'john@doe.com',
      'shipping[name]': 'John Doe',
      'shipping[street]': '318 Homer Street',
      street2: '',
      'shipping[town_city]': 'Vancouver',
      'shipping[postal_zip_code]': 'V6B 2V2',
      orderNotes: '',
      countries: {},
      subdivisions: {},

      'fulfillment[shipping_method]': '',
      cardNumber: ccFormat('4242424242424242'),
      expMonth: '11',
      expYear: '22',
      cvc: '123',
      billingPostalZipcode: 'V6B 2V2',

      errors: {
        'fulfillment[shipping_method]': null,
        gateway_error: null,
        'customer[email]': null,
        'shipping[name]': null,
        'shipping[street]': null,
        'shipping[town_city]': null,
        'shipping[postal_zip_code]': null
      },

      discountCode: 'CUSTOMCOMMERCE',

      selectedGateway: 'test_gateway',

      loading: false,
    }

    this.captureOrder = this.captureOrder.bind(this);
    this.generateToken = this.generateToken.bind(this);
    this.getAllCountries = this.getAllCountries.bind(this);
    this.getRegions = this.getRegions.bind(this);
    this.handleChangeForm = this.handleChangeForm.bind(this);
    this.handleDiscountChange = this.handleDiscountChange.bind(this);
    this.handleGatewayChange = this.handleGatewayChange.bind(this);
    this.redirectOutOfCheckout = this.redirectOutOfCheckout.bind(this);
  }

  async componentDidMount() {
    // if cart is empty then redirect out of checkout;
    if (this.props.cart && this.props.cart.total_items === 0) {
      this.redirectOutOfCheckout()
    }
    // on initial mount generate checkout token object from the cart,
    // and then subsequently below in componentDidUpdate if the props.cart.total_items has changed
    this.generateToken();

    this.getRegions(this.state.deliveryCountry)
  }

  componentDidUpdate(prevProps, prevState) {
    // if cart items have changed then regenerate checkout token object to reflect changes.
    if (prevProps.cart && prevProps.cart.total_items !== this.props.cart.total_items && !this.props.orderReceipt) {
      // reset selected shipping option
      this.setState({
        'fulfillment[shipping_method]': '',
      })
      // regenerate checkout token object since cart has been updated
      this.generateToken();
    }

    const hasDeliveryCountryChanged = prevState.deliveryCountry !== this.state.deliveryCountry;
    const hasDeliveryRegionChanged = prevState.deliveryRegion !== this.state.deliveryRegion;

    // refresh list of regions when delivery country has changed
    if (hasDeliveryCountryChanged) {
      this.getRegions(this.state.deliveryCountry);
    }

    // if delivery country or region have changed, and we still have a checkout token object, then refresh the token,
    // and reset the previously selected shipping method
    if (hasDeliveryCountryChanged || hasDeliveryRegionChanged && this.props.checkout) {
      // reset selected shipping option since previous checkout token live object shipping info
      // was set based off delivery country, deliveryRegion
      this.setState({
        'fulfillment[shipping_method]': '',
      })
      this.generateToken();
    }

    // if selected shippiing option changes, regenerate checkout token object to reflect changes
    if (
      prevState['fulfillment[shipping_method]'] !== this.state['fulfillment[shipping_method]']
      && this.state['fulfillment[shipping_method]'] && this.props.checkout
    ) {
      // update checkout token object with shipping information
      this.props.dispatchSetShippingOptionsInCheckout(
        this.props.checkout.id,
        this.state['fulfillment[shipping_method]'],
        this.state.deliveryCountry,
        this.state.deliveryRegion
      );
    }
  }

  /**
   * Generate a checkout token. This is called when the checkout first loads.
   */
  generateToken() {
    const { cart, dispatchGenerateCheckout, dispatchGetShippingOptions } = this.props;
    const { deliveryCountry: country, deliveryRegion: region } = this.state;

    return dispatchGenerateCheckout(cart.id)
      .then((checkout) => {
        // continue and dispatch getShippingOptionsForCheckout to get shipping options based on checkout.id
        this.getAllCountries(checkout);
        return dispatchGetShippingOptions(checkout.id, country, region)
      })
      .catch(error => {
        console.log('error caught in checkout/index.js in generateToken', error);
      })
  }

  redirectOutOfCheckout() {
    this.props.router.push('/');
  }

  handleGatewayChange(selectedGateway) {
    this.setState({
      selectedGateway,
    });
  }

  handleDiscountChange(e) {
    e.preventDefault();
    if (!this.state.discountCode.trim() || !this.props.checkout) {
      return;
    }

    this.props.dispatchSetDiscountCodeInCheckout(this.props.checkout.id, this.state.discountCode)
      .then(resp => {
        if (resp.valid) {
          return this.setState({
            discountCode: '',
          });
        }
        return Promise.reject(resp);
      })
      .catch(error => {
        alert('Sorry, the discount code could not be applied');
      });
  }

  handleChangeForm(e) {
    // when input cardNumber changes format using ccFormat helper
    if (e.target.name === 'cardNumber') {
      e.target.value = ccFormat(e.target.value)
    }
    // update form's input by name in state
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  /**
   * Capture the order
   *
   * @param {Event} e
   */
  captureOrder(e) {
    e.preventDefault();

    // reset error states
    this.setState({
      errors: {
        'fulfillment[shipping_method]': null,
        gateway_error: null,
        'shipping[name]': null,
        'shipping[street]': null,
      },
      loading: true,
    });

    // set up line_items object and inner variant object for order object below
    const line_items = this.props.checkout.live.line_items.reduce((obj, lineItem) => {
      const variants = lineItem.variants.reduce((obj, variant) => {
        obj[variant.variant_id] = variant.option_id;
        return obj;
      }, {});
      obj[lineItem.id] = { ...lineItem, variants };
      return obj;
    }, {});

    // construct order object
    const newOrder = {
      line_items,
      customer: {
        firstname: this.state.firstName,
        lastname: this.state.lastName,
        email: this.state['customer[email]']
      },
      // collected 'order notes' data for extra field configured in the Chec Dashboard
      extrafields: {
        extr_j0YnEoqOPle7P6: this.state.orderNotes,
      },
      shipping: {
        name: this.state['shipping[name]'],
        country: this.state.deliveryCountry,
        street: this.state['shipping[street]'] + this.state.street2,
        town_city: this.state['shipping[town_city]'],
        county_state: this.state.deliveryRegion,
        postal_zip_code: this.state['shipping[postal_zip_code]']
      },
      fulfillment: {
        shipping_method: this.state['fulfillment[shipping_method]']
      },
      payment: {
        gateway: this.state.selectedGateway,
      },
    }

    // if test gateway selected add necessary card data
    // for the order to be completed.
    if (this.state.selectedGateway === 'test_gateway') {
      newOrder.payment.card = {
        number: this.state.cardNumber,
        expiry_month: this.state.expMonth,
        expiry_year: this.state.expYear,
        cvc: this.state.cvc,
        postal_zip_code: this.state.billingPostalZipcode,
      }
    }

    // capture order
    // set order-receipt global state
    // and redirect to confirmation page
    // or handle errors
    this.props.dispatchCaptureOrder(this.props.checkout.id, newOrder)
      .then(() => {
        this.props.router.push('/checkout/confirm');
      })
      .catch(({ data: { error = {} }}) => {
        this.setState({ loading: false });
        let errorToAlert = '';
        if (error.type === 'validation') {
          console.log('error while capturing order', error.message)

          error.message.forEach(({param, error}, i) => {
            this.setState({
              errors: {
                ...this.state.errors,
                [param]: error
              }
            })
          })

          errorToAlert = error.message.reduce((string, error) => {
            return `${string} ${error.error}`
          }, '');
        }

        if (error.type === 'gateway_error' || error.type === 'not_valid' || error.type === 'bad_request') {
          this.setState({
            errors: {
              ...this.state.errors,
              [(error.type === 'not_valid' ? 'fulfillment[shipping_method]' : error.type)]: error.message
            },
          })
          errorToAlert = error.message
        }
        if (errorToAlert) {
          alert(errorToAlert);
        }
      });
  }

  /**
   * Fetch all available countries for shipping
   */
  getAllCountries(checkout) {
    commerce.services.localeListShippingCountries(checkout.id).then(resp => {
      this.setState({
        countries: resp.countries
      })
    }).catch(error => console.log(error))
  }

  /**
   * Fetch available shipping regions for the chosen country
   *
   * @param {string} deliveryCountry
   */
  getRegions(deliveryCountry) {
    commerce.services.localeListSubdivisions(deliveryCountry).then(resp => {
      this.setState({
        subdivisions: resp.subdivisions
      })
    }).catch(error => console.log(error))
  }

  render() {
    const { checkout, shippingOptions } = this.props;
    const selectedShippingOption = shippingOptions.find(({id}) => id === this.state['fulfillment[shipping_method]']);
     const { state, handleGatewayChange, handleChangeForm, captureOrder, handleFormChanges, handleDiscountChange } = this;
    if (this.state.loading) {
      return <Loader />;
    }

    return (
      <Root>
        <Head>
          <title>Checkout</title>
        </Head>

         { checkout && (<BuilderComponent model="checkout-details" data={{
           checkoutDetails: {
             checkout,
             state,
             handleGatewayChange,
             handleChangeForm,
             captureOrder,
             handleFormChanges,
             selectedShippingOption,
             shippingOptions,
             handleDiscountChange
             }
           }} />)
          }
      </Root>
    );
  }
}

CheckoutPage.propTypes = {
  orderReceipt: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([null]),
  ]),
  checkout: PropTypes.object,
  cart: PropTypes.object,
  shippingOptions: PropTypes.array,
  dispatchGenerateCheckout: PropTypes.func,
  dispatchGetShippingOptions: PropTypes.func,
  dispatchSetDiscountCodeInCheckout: PropTypes.func,
}

export default withRouter(
  connect(({ checkout: { checkoutTokenObject, shippingOptions }, cart, orderReceipt }) => ({
    checkout: checkoutTokenObject,
    shippingOptions,
    cart,
    orderReceipt,
  }), {
  dispatchGenerateCheckout,
  dispatchGetShippingOptions,
  dispatchSetShippingOptionsInCheckout,
  dispatchSetDiscountCodeInCheckout,
  dispatchCaptureOrder,
})(CheckoutPage));
