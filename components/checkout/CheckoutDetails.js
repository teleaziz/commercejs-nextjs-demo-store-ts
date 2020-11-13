
import ShippingForm from './common/ShippingForm';
import PaymentDetails from './common/PaymentDetails';
import BillingDetails from './common/BillingDetails';
import Link from 'next/link';

export default ({ checkoutDetails, titleStyle }) => {
  const {checkout, state, handleGatewayChange, handleChangeForm, captureOrder, handleFormChanges, selectedShippingOption, shippingOptions, handleDiscountChange } = checkoutDetails;

return <div className="custom-container py-5 my-4 my-sm-5">

{/* Breadcrums Mobile */}
<div
  className="d-flex d-sm-none px-4 py-3 borderbottom border-color-gray400 justify-content-center"
  style={{ margin: '0 -1.5rem' }}
>
  <Link href="/collection">
    <div className="font-size-caption text-decoration-underline cursor-pointer">
      Cart
    </div>
  </Link>
  <img src="/icon/arrow-right.svg" className="w-16 mx-1" alt="Arrow icon"/>
  <div className="font-size-caption cursor-pointer">
    Checkout
  </div>
</div>

{/* Row */}
<div className="row mt-4">
  <div className="col-12 col-md-10 col-lg-6 offset-md-1 offset-lg-0">
    {/* Breadcrums Desktop */}
    <div className="d-none d-sm-flex pb-4">
      <Link href="/collection">
        <div className="font-size-caption text-decoration-underline cursor-pointer">
          Cart
        </div>
      </Link>
      <img src="/icon/arrow-right.svg" className="w-16 mx-1" alt="Arrow icon"/>
      <div className="font-size-caption font-weight-bold cursor-pointer">
        Checkout
      </div>
    </div>
    {
      checkout
      && (
      <form onChange={handleChangeForm}>
        {/* ShippingDetails */}
        <p style={titleStyle} className="font-size-subheader font-weight-semibold mb-4">
          Customer and Shipping Details
        </p>
        <div className="mb-5">
          <ShippingForm
            firstName={state.firstName}
            lastName={state.lastName}
            customerEmail={state['customer[email]']}
            shippingOptions={shippingOptions}
            countries={state.countries}
            subdivisions={state.subdivisions}
            deliveryCountry={state.deliveryCountry}
            deliveryRegion={state.deliveryRegion}
            selectedShippingOptionId={state['fulfillment[shipping_method]']}
            selectedShippingOption={selectedShippingOption}
            shippingStreet={state['shipping[street]']}
            shippingStreet2={state.street2}
            shippingTownCity={state['shipping[town_city]']}
            shippingPostalZipCode={state['shipping[postal_zip_code]']}
            orderNotes={state.orderNotes}
          />
        </div>

        {/* Payment Methods */}
        <PaymentDetails
          gateways={checkout.gateways}
          onChangeGateway={handleGatewayChange}
          selectedGateway={state.selectedGateway}

          cardNumber={state.cardNumber}
          expMonth={state.expMonth}
          expYear={state.expYear}
          cvc={state.cvc}
          billingPostalZipcode={state.billingPostalZipcode}
        />

        {/* Billing Address */}
        {
          checkout.collectsBillingAddress ?
          <BillingDetails />
          : ''
        }
          <p className="checkout-error">{ !selectedShippingOption ? 'Select a shipping option!' : '' }</p>
          <button
            type="submit"
            className="bg-black font-color-white w-100 border-none h-56 font-weight-semibold d-none d-lg-block checkout-btn"
            disabled={!selectedShippingOption}
            onClick={captureOrder}
          >
            Make payment
          </button>
        </form>
      )
    }
  </div>

  <div className="col-12 col-lg-5 col-md-10 offset-md-1">
    <div className="bg-brand200 p-5 checkout-summary">
      <div className="borderbottom font-size-subheader border-color-gray400 pb-2 font-weight-medium">
        Your order
      </div>
      <div className="pt-3 borderbottom border-color-gray400">
        {(checkout.live ? checkout.live.line_items : []).map((item, index, items) => {
          return (
            <div
              key={item.id}
              className="d-flex mb-2"
            >
              { (item && item.media)
                && (<img className="checkout__line-item-image mr-2" src={item.media.source} alt={item.product_name}/>)
              }
              <div className="d-flex flex-grow-1">
                <div className="flex-grow-1">
                  <p className="font-weight-medium">
                    {item.product_name}
                  </p>
                  <p className="font-color-light">Quantity: {item.quantity}</p>
                  <div className="d-flex justify-content-between mb-2">
                    {item.variants.map((variant) =>
                      <p key={variant.variant_id} className="font-color-light font-weight-small">
                        {variant.variant_name}: {variant.option_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right font-weight-semibold">
                  ${item.line_total.formatted_with_code}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <form className="row py-3 borderbottom border-color-gray400">
        <input
          name="discountCode"
          onChange={handleFormChanges}
          value={state.discountCode}
          placeholder="Gift card or discount code"
          className="mr-2 col"
        />
        <button
          className="font-color-white border-none font-weight-medium px-4 col-auto"
          disabled={!checkout || undefined}
          onClick={handleDiscountChange}
        >
          Apply
        </button>
      </form>
      <div className="py-3 borderbottom border-color-black">
        {[
          {
            name: 'Subtotal',
            amount: checkout.live ? checkout.live.subtotal.formatted_with_symbol : '',
          },
          {
            name: 'Tax',
            amount: checkout.live ? checkout.live.tax.amount.formatted_with_symbol : '',
          },
          {
            name: 'Shipping',
            amount: selectedShippingOption ? `${selectedShippingOption.description} - ${selectedShippingOption.price.formatted_with_symbol}` : 'No shipping method selected',
          },
          {
            name: 'Discount',
            amount: (checkout.live && checkout.live.discount && checkout.live.discount.code) ? `Saved ${checkout.live.discount.amount_saved.formatted_with_symbol}` : 'No discount code applied',
          }
        ].map((item, i) => (
          <div key={i} className="d-flex justify-content-between align-items-center mb-2">
            <p>{item.name}</p>
            <p className="text-right font-weight-medium">
              {item.amount}
            </p>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-between align-items-center mb-2 pt-3">
        <p className="font-size-title font-weight-semibold">
          Total amount
        </p>
        <p className="text-right font-weight-semibold font-size-title">
          $ { checkout.live ? checkout.live.total.formatted_with_code : '' }
        </p>
      </div>

      <button
        type="submit"
        className="bg-black mt-4 font-color-white w-100 border-none h-56 font-weight-semibold d-lg-none"
        onClick={captureOrder}
        disabled={!selectedShippingOption}
      >
        Make payment
      </button>
    </div>
  </div>
</div>
</div>
}