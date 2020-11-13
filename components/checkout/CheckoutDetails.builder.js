import CheckoutDetails from './CheckoutDetails';

import { Builder } from '@builder.io/react';

Builder.registerComponent(CheckoutDetails, {
  name: 'CheckoutDetails',
  description: 'Dynamic Checkout details, should only be used in checkout pages',
  defaults: {
    bindings: {
      'component.options.checkoutDetails': 'state.checkoutDetails'
  }},
  inputs: [
    {
      type: 'uiStyle',
      name: 'titleStyle',
      // defaultValue is mandatory for styles
      defaultValue: {}
    },
    {
      type: 'text',
      name: 'title',
    }
  ]

});
