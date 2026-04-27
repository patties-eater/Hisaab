const buckets = new Map();

function normalizePart(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanupExpiredBuckets(now = Date.now()) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

setInterval(() => cleanupExpiredBuckets(), 5 * 60 * 1000).unref();

function createRateLimiter({
  windowMs,
  limit,
  keyGenerator,
  message,
  countSuccessfulRequests = false,
  resetOnSuccess = false,
}) {
  if (!windowMs || !limit || typeof keyGenerator !== "function") {
    throw new Error("createRateLimiter requires windowMs, limit, and keyGenerator");
  }

  return function rateLimitMiddleware(req, res, next) {
    const key = keyGenerator(req);

    if (!key) {
      return next();
    }

    const now = Date.now();
    const existing = buckets.get(key);

    if (existing && existing.resetAt <= now) {
      buckets.delete(key);
    }

    const current = buckets.get(key);
    if (current && current.count >= limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        error: message,
        retryAfterSeconds,
      });
    }

    res.on("finish", () => {
      const statusCode = res.statusCode;
      const isSuccessful = statusCode < 400;

      if (resetOnSuccess && isSuccessful) {
        buckets.delete(key);
        return;
      }

      if (!countSuccessfulRequests && isSuccessful) {
        return;
      }

      const bucket = buckets.get(key);
      const nextBucket =
        bucket && bucket.resetAt > now
          ? bucket
          : { count: 0, resetAt: now + windowMs };

      nextBucket.count += 1;
      buckets.set(key, nextBucket);
    });

    next();
  };
}

function createLoginLimiter({
  windowMs,
  limit,
  message,
  identifierExtractor = (req) => req.body?.email,
}) {
  return createRateLimiter({
    windowMs,
    limit,
    message,
    resetOnSuccess: true,
    keyGenerator: (req) => {
      const identifier = normalizePart(identifierExtractor(req));
      const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
      return `login:${ip}:${identifier || "missing-identifier"}`;
    },
  });
}

function createRegistrationLimiter({ windowMs, limit, message }) {
  return createRateLimiter({
    windowMs,
    limit,
    message,
    countSuccessfulRequests: true,
    keyGenerator: (req) => {
      const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
      return `register:${ip}`;
    },
  });
}

module.exports = {
  createLoginLimiter,
  createRegistrationLimiter,
};
