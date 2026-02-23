const test = require("node:test");
const assert = require("node:assert/strict");
const { ZodError } = require("zod");
const { registerSchema, loginSchema } = require("../src/validators/authValidators");

test("registerSchema accepts valid payload and normalizes email", () => {
  const result = registerSchema.parse({
    fullName: "Ali Valiyev",
    email: "ALI@EXAMPLE.COM ",
    password: "StrongPass#123"
  });

  assert.equal(result.email, "ali@example.com");
  assert.equal(result.fullName, "Ali Valiyev");
});

test("registerSchema rejects weak password", () => {
  assert.throws(
    () =>
      registerSchema.parse({
        fullName: "Ali Valiyev",
        email: "ali@example.com",
        password: "weakpass"
      }),
    ZodError
  );
});

test("registerSchema rejects invalid full name characters", () => {
  assert.throws(
    () =>
      registerSchema.parse({
        fullName: "Ali<script>",
        email: "ali@example.com",
        password: "StrongPass#123"
      }),
    ZodError
  );
});

test("loginSchema normalizes email", () => {
  const result = loginSchema.parse({
    email: "USER@EXAMPLE.COM ",
    password: "anything"
  });

  assert.equal(result.email, "user@example.com");
});
