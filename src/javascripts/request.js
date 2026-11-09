// Retry reads only. A repeated write can charge or submit an order twice.
export default function createRequester(options) {
  let pending = 0;
  return async function request(config, authenticated = true) {
    const tracked = !config.noLoadingNeeded;
    const token = options.token();
    if (tracked) options.loading(++pending > 0);
    const instance = options.axios.create({
      baseURL: options.baseURL(),
      timeout: 15000,
      headers: authenticated ? {
        authorization: "Token " + token,
        "Content-Type": "application/json"
      } : {}
    });
    try {
      for (let attempt = 0; ; attempt++) {
        try {
          return await instance.request(config);
        } catch (error) {
          const status = error.response && error.response.status;
          const transient = !error.response || [408, 502, 503, 504].includes(status);
          const read = (config.method || "GET").toUpperCase() === "GET";
          if (read && transient && !error.__CANCEL__ && attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
            continue;
          }
          if (options.failed) options.failed(error);
          if (authenticated && status === 401 && options.token() === token) options.unauthorized();
          if (transient && !error.__CANCEL__) options.unavailable();
          throw error;
        }
      }
    } finally {
      if (tracked) options.loading(--pending > 0);
    }
  };
}
