export const posthogEvents = {
  // Browsing
  page_viewed: "site:page_viewed",
  product_viewed: "product:product_viewed",
  engaged: "engagement:engaged",

  // Configurator
  config_option_selected: "config:option_selected",
  size_selected: "config:size_selected",
  installation_selected: "config:installation_selected",
  delivery_applied: "config:delivery_applied",
  price_recalculated: "config:price_recalculated",

  // Conversion intent
  cta_clicked: "cta:clicked",
  quote_form_started: "quote:form_started",
  quote_field_error: "quote:field_error",
  quote_abandoned: "quote:abandoned",
  quote_form_opened: "quote:form_opened",
  quote_form_submitted: "quote:form_submitted",
  quote_thank_you_viewed: "quote:thank_you_viewed",
};
