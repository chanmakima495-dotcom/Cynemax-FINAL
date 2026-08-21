const API = "https://moviebox-internal-apisk.onrender.com";

exports.handler = async (event) => {
  const path = event.path.replace("/.netlify/functions/proxy", "") || "/";
  const qs   = event.rawQuery ? `?${event.rawQuery}` : "";
  const url  = `${API}${path}${qs}`;

  try {
    const res  = await fetch(url, { headers: { "Content-Type": "application/json" } });
    const body = await res.text();
    return {
      statusCode: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body,
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
