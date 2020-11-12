import React, { Component } from 'react';
import commerce from '../../lib/commerce';
import { connect } from 'react-redux';
import Head from 'next/head';
import Root from '../../components/common/Root';
import reduceProductImages from '../../lib/reduceProductImages';
import { BuilderComponent, builder, Builder } from '@builder.io/react';
import '../../components/ProductPageContent/ProductPageContent.builder';

builder.init(process.env.BUILDER_API_KEY);
Builder.isStatic = true;


class Product extends Component {
  render() {
    const { product, builderPage } = this.props;

    const images = reduceProductImages(product);


    return (
      <Root>
        <Head>
          <title>{ product.name } | commerce</title>
        </Head>
        <div className="py-5 my-5">
        <BuilderComponent model="product-page-template" data={{product, images }} content={builderPage} />
        </div>
    </Root>
    );
  }
}

/**
 * Use getStaticPaths() to pre-render PDP (product display page) according to page path
 */
export async function getStaticPaths() {
  const { data: products } = await commerce.products.list();

  // Get the paths we want to pre-render based on product
  const paths = products.map(product => ({
    params: {
      permalink: product.permalink,
    },
  }));

  // We'll pre-render only these paths at build time.
  return {
    paths,
    // { fallback: false } means other routes should 404.
    fallback: false,
  }
}

// This also gets called at build time, and fetches the product to view
export async function getStaticProps({ params: { permalink } }) {
  // params contains the product `permalink`.
  // If the route is like /product/shampoo-conditioner, then params.permalink is shampoo-conditioner
  const product = await commerce.products.retrieve(permalink, { type: 'permalink '});
  const builderPage = await builder.get('product-page-template', { userAttributes: { permaLink: permalink }, cacheSeconds: 2, staleCacheSeconds: 2, noTraverse: false }).promise();

  // Pass product data to the page via props
  return {
    props: {
      product,
      // parsing and stringifying to remove undefined values that next complained about
      builderPage: JSON.parse(JSON.stringify(builderPage)),
    },
  };
}

export default connect(state => state)(Product);
