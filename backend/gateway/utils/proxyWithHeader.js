import proxy from "express-http-proxy";

const proxyWithHeader = (serviceUrl) => {
  return proxy(serviceUrl, {
    proxyReqPathResolver: (req) => {
      return req.originalUrl;   
    },

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // protect middleware থেকে আসা user info inject করো
      if (srcReq.user) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        proxyReqOpts.headers["x-user-name"] = srcReq.user.name;
        proxyReqOpts.headers["x-user-email"] = srcReq.user.email;
      }
      return proxyReqOpts;
    },
  });
};

export default proxyWithHeader;