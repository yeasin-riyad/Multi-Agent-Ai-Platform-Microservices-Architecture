import proxy from 'express-http-proxy';

const proxyWithHeader = (serviceUrl) => {
    return proxy(serviceUrl, {
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            // Check if req.user was successfully populated by our protect middleware
            if (srcReq.user) {
                proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
                proxyReqOpts.headers["x-user-name"] = srcReq.user.name;
                proxyReqOpts.headers["x-user-email"] = srcReq.user.email;
            }
            return proxyReqOpts;
        }
    });
};

export default proxyWithHeader;
