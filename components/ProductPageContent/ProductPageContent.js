import React from 'react';
import CarouselImages from '../productAssets/CarouselImages';
import ProductDetail from '../productAssets/ProductDetail';
import CategoryList from '../products/CategoryList';
import { Collapse } from 'react-collapse';

const defaultDetails = `<p>
  you can override this in builder.io per product, using the permalink as targeting anchor
</p>`;


export default ({product, images, details }) =>
  <div className="main-product-content">
    {/* Sidebar */}
    <div className="product-sidebar">
      <CategoryList
        className="product-left-aside__category-list"
        current={ product.categories[0] && product.categories[0].id }
      />
      <CarouselImages images={images} />
    </div>

    <div className="product-images">
      <div className="flex-grow-1">
        {Array.isArray(images) ? (images.map((image, i) => (
          <img
            key={i}
            src={image}
            className="w-100 mb-3 carousel-main-images"
          />
        ))) : (
          ''
        )}
      </div>
    </div>

    {/* Right Section - Product Details */}
    <div className="product-detail">
      <ProductDetail product={product} />

      <div
        className="d-flex cursor-pointer py-3 justify-content-between font-weight-medium"
      >
        Shipping and returns
        <img src="/icon/plus.svg" />
      </div>
      <Collapse>
        <div className="pb-4 font-color-medium">
          Arrives in 5 to 7 days, returns accepted within 30
          days. For more information, click here.
        </div>
      </Collapse>
      <div className="h-1 border-bottom border-color-black" />
      <div
        className="d-flex cursor-pointer py-3 justify-content-between font-weight-medium"
      >
        Details
        <img src="/icon/plus.svg" />
      </div>
      <Collapse isOpened>
        <div
          className="pb-4 font-color-medium"
          dangerouslySetInnerHTML={{
            __html: details || defaultDetails
          }}
        />
      </Collapse>
      <div className="h-1 borderbottom border-color-black" />
    </div>
  </div>
