const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/payza";
process.env.JWT_SECRET = process.env.JWT_SECRET || "x".repeat(64);
process.env.JWT_ISSUER = process.env.JWT_ISSUER || "payza-api";
process.env.JWT_AUDIENCE = process.env.JWT_AUDIENCE || "payza-clients";

const requireAuth = require("../src/middleware/auth");

function createRes() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };
}

test("requireAuth rejects missing bearer token", () => {
  const req = { headers: {} };
  const res = createRes();
  let called = false;

  requireAuth(req, res, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.payload?.error, "Unauthorized");
});

test("requireAuth rejects invalid token", () => {
  const req = {
    headers: {
      authorization: "Bearer not-a-valid-jwt"
    }
  };
  const res = createRes();
  let called = false;

  requireAuth(req, res, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.payload?.error, "Invalid token");
});

test("requireAuth accepts valid token and attaches user", () => {
  const token = jwt.sign(
    { email: "ali@example.com" },
    process.env.JWT_SECRET,
    {
      subject: "11111111-1111-1111-1111-111111111111",
      expiresIn: "10m",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      algorithm: "HS256"
    }
  );

  const req = {
    headers: {
      authorization: `Bearer ${token}`
    }
  };
  const res = createRes();
  let called = false;

  requireAuth(req, res, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.deepEqual(req.user, {
    id: "11111111-1111-1111-1111-111111111111",
    email: "ali@example.com"
  });
});
