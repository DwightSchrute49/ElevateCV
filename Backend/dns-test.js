const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.interview-ai-cluster.skj8bd0.mongodb.net",
  (err, records) => {
    if (err) {
      console.error("DNS Error:", err);
      return;
    }

    console.log(records);
  },
);
