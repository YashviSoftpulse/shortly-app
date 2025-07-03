import React, { useEffect } from "react";
import { fetchData, getApiURL } from "../../action";

function Callback() {
  const urlParams = new URLSearchParams(window.location.search);
  const planType = urlParams.get("plan_type");
  const chargeId = urlParams.get("charge_id");

  const getPricingPlan = async () => {
    const formData = new FormData();
    formData.append("plan_type", planType);
    formData.append("charge_id", chargeId);
    const response = await fetchData(getApiURL("pricing/callback"), formData);

    if (response.status === true) {
      shopify.toast.show(response.message, { duration: 3000 });
      window.open(`/dashboard${window.location.search}`);
    }
  };

  useEffect(() => {
    getPricingPlan();
  }, []);

  return;
}

export default Callback;
