import React from "react";

const ShippingPage = () => {
  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Shipping Information
        </h1>

        <section className="mt-8 space-y-8 text-gray-800">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              The Toronto Sauna Co. Responsibilities
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Building and packing your sauna in a crate.</li>
              <li>Arrange for shipping to a local depot.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Trucking Company Responsibilities
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Making an appointment for you to pick up your sauna.
              </li>
              <li>
                Help load your sauna on your trailer when you arrive for pick
                up.
              </li>
              <li>
                The trucking company is NOT responsible for delivering the
                crate to your home address.
              </li>
            </ul>
            <p className="mt-3 text-sm text-gray-700">
              Some depots may offer a final mile service for an additional
              cost.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Customer Responsibilities
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Returning phone calls to the trucking company in a timely
                manner to arrange pick up.
              </li>
              <li>
                Determine how the sauna is going to get from the depot to your
                home.
              </li>
              <li>Crates will vary from 6 feet long to 14 feet long.</li>
              <li>
                Crate weight will vary from 800 lbs to 1600 lbs, depending on
                the size of the sauna.
              </li>
              <li>
                Arriving to the depot at an agreed upon time to pick up the
                sauna.
              </li>
              <li>
                If the crate arrives damaged, you can accept the shipment;
                please take pictures of the damage, and note the damage on the
                shipper’s Bill of Lading (BOL). Immediately contact The Toronto
                Sauna Company, so we can contact the shipper.
              </li>
              <li>
                Mark the Bill of Lading (BOL) with “(Crate arrived
                open/damaged- Possible Hidden Damage.”
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p>
              All shortages, defects or shipping errors must be reported within
              14 days of the shipping date. Otherwise, any claim will be
              processed under “Warranty Service”.
            </p>
            <p>
              Shipping costs are quoted on a custom basis for most destinations
              in Canada and the USA.
            </p>
            <p>
              We reserve the right to charge fees to cover actual shipping
              costs. In the event shipping costs exceed the actual fees
              charged, the purchaser will be notified before shipping of any
              extra fees. If extra shipping fees are not agreed to be charged,
              then the order may be cancelled, and all funds returned to the
              purchaser.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
 
export default ShippingPage;