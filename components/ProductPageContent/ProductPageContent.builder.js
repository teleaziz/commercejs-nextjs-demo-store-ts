import { Builder, builder } from '@builder.io/react';
import ProductPageContent from './ProductPageContent';
import ClientReview from '../productAssets/ClientReview';
import SuggestedProducts from '../productAssets/SuggestedProducts';
import ExploreBanner from '../productAssets/ExploreBanner';
import Footer from '../common/Footer';
import SocialMedia from '../common/SocialMedia';

Builder.registerComponent(ProductPageContent, {
  name: 'ProductPageContent',
  description: 'Dynamic product details, included in SSR, should only be used in product pages',
  defaults: {
    bindings: {
      'component.options.product': 'state.product',
      'component.options.images': 'state.images',
    },
  },
  inputs: [
    {
      type: 'text',
      name: 'details',
    }
  ]

});

Builder.registerComponent(ClientReview, {
  name: 'ClientReview',
});

Builder.registerComponent(SuggestedProducts, {
  name: 'SuggestedProducts',
});

Builder.registerComponent(ExploreBanner, {
  name: 'ExploreBanner',
});

Builder.registerComponent(Footer, {
  name: 'Footer',
});

Builder.registerComponent(SocialMedia, {
  name: 'SocialMedia',
});
