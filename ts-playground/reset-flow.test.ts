import assert from "node:assert/strict";
import { ApiError } from "../src/api/api-error.ts";
import { createResetFlow, type CodeStep } from "../src/auth/create-reset-flow.ts";

type Log = string[];

function setup(overrides: { forgotSuccess?: boolean; verifySuccess?: boolean; resetSuccess?: boolean } = {}) {
  const log: Log = [];
  let counter = 0;
  const flow = createResetFlow({
    authApi: {
      forgotPassword: async (identifier) => {
        counter += 1;
        log.push(`forgot:${identifier}`);
        return {
          success: overrides.forgotSuccess ?? true,
          reset_token: `rt${counter}`,
          masked_email: "a***@ornek.com",
          expires_in_minutes: 15,
          message: "Kod gönderildi",
        };
      },
      verifyResetCode: async (resetToken, code) => {
        log.push(`verify:${resetToken}:${code}`);
        return {
          success: overrides.verifySuccess ?? true,
          verified_token: "vt1",
          message: "Kod doğrulandı",
        };
      },
      resetPassword: async (verifiedToken, newPassword) => {
        log.push(`reset:${verifiedToken}:${newPassword}`);
        return { success: overrides.resetSuccess ?? true, message: "Şifre güncellendi" };
      },
    },
  });
  return { flow, log };
}

// tam akış: kimlik → kod → yeni şifre → bitti
{
  const { flow, log } = setup();
  const codeStep = await flow.requestCode("ali@ornek.com");
  assert.deepEqual(codeStep, {
    step: "code",
    identifier: "ali@ornek.com",
    resetToken: "rt1",
    maskedEmail: "a***@ornek.com",
    expiresInMinutes: 15,
  });

  const passwordStep = await flow.submitCode(codeStep, "123456");
  assert.deepEqual(passwordStep, { step: "newPassword", verifiedToken: "vt1" });

  const done = await flow.submitNewPassword(passwordStep, "yeniSifre");
  assert.deepEqual(done, { step: "done" });

  assert.deepEqual(log, [
    "forgot:ali@ornek.com",
    "verify:rt1:123456",
    "reset:vt1:yeniSifre",
  ]);
}

// tekrar gönder: aynı kimlikle yeni kod istenir, yeni reset_token gelir
{
  const { flow, log } = setup();
  const first = await flow.requestCode("ali");
  const second = await flow.resend(first);
  assert.equal(second.identifier, "ali");
  assert.equal(second.resetToken, "rt2");
  assert.deepEqual(log, ["forgot:ali", "forgot:ali"]);
}

// success:false → ApiError (kind client, sunucunun mesajı)
for (const [name, run] of [
  ["forgot", (s: ReturnType<typeof setup>) => s.flow.requestCode("ali")],
  ["verify", (s: ReturnType<typeof setup>) => s.flow.submitCode({ step: "code", identifier: "a", resetToken: "rt", maskedEmail: "", expiresInMinutes: 15 } satisfies CodeStep, "123456")],
  ["reset", (s: ReturnType<typeof setup>) => s.flow.submitNewPassword({ step: "newPassword", verifiedToken: "vt" }, "x")],
] as const) {
  const s = setup({ forgotSuccess: name !== "forgot", verifySuccess: name !== "verify", resetSuccess: name !== "reset" });
  await assert.rejects(run(s), (err: unknown) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.info.kind, "client");
    return true;
  });
}

// sunucu hatası (ör. yanlış kod, 400) olduğu gibi iletilir
{
  const original = new ApiError({ kind: "client", message: "Geçersiz doğrulama kodu", status: 400 });
  const flow = createResetFlow({
    authApi: {
      forgotPassword: async () => { throw new Error("kullanılmaz"); },
      verifyResetCode: async () => { throw original; },
      resetPassword: async () => { throw new Error("kullanılmaz"); },
    },
  });
  await assert.rejects(
    flow.submitCode({ step: "code", identifier: "a", resetToken: "rt", maskedEmail: "", expiresInMinutes: 15 }, "000000"),
    (err: unknown) => {
      assert.equal(err, original);
      return true;
    }
  );
}

console.log("reset-flow testleri geçti ✅");