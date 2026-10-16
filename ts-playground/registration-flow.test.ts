import assert from "node:assert/strict";
import { ApiError } from "../src/api/api-error.ts";
import {
  createRegistrationFlow,
  type RegistrationCodeStep,
  type RegistrationForm,
} from "../src/auth/create-registration-flow.ts";
import type { RegisterConfirmResponse, RegisterStartResponse } from "../src/types/auth.ts";
import { sampleUser } from "./fixtures.ts";

const form: RegistrationForm = { username: "ali", password: "123456", email: "ali@ornek.com" };

function setup(
  overrides: {
    start?: Partial<RegisterStartResponse>;
    confirm?: Partial<RegisterConfirmResponse>;
    confirmError?: unknown;
  } = {}
) {
  const log: string[] = [];
  let startCount = 0;
  const flow = createRegistrationFlow({
    authApi: {
      startRegistration: async (username, password, email) => {
        startCount += 1;
        log.push(`start:${username}:${password}:${email}`);
        return {
          success: true,
          token: `ticket${startCount}`,
          masked_email: "a**@ornek.com",
          message: "Kod gönderildi",
          ...overrides.start,
        };
      },
      confirmRegistration: async (ticket, code) => {
        log.push(`confirm:${ticket}:${code}`);
        if (overrides.confirmError !== undefined) throw overrides.confirmError;
        return {
          success: true,
          message: "Hesap oluşturuldu",
          token: "jwt-token",
          user: sampleUser,
          username: "ali",
          ...overrides.confirm,
        };
      },
    },
  });
  return { flow, log };
}

// tam akış: form → kod → oturum bilgisi
{
  const { flow, log } = setup();
  const step = await flow.start(form);
  assert.deepEqual(step, {
    step: "code",
    form,
    ticket: "ticket1",
    maskedEmail: "a**@ornek.com",
  });

  const result = await flow.confirm(step, "123456");
  assert.equal(result.token, "jwt-token");
  assert.deepEqual(result.user, sampleUser);
  assert.deepEqual(log, ["start:ali:123456:ali@ornek.com", "confirm:ticket1:123456"]);
}

// tekrar gönder: aynı form bilgisiyle kayıt yeniden başlar, yeni bilet gelir
{
  const { flow, log } = setup();
  const first = await flow.start(form);
  const second = await flow.resend(first);
  assert.equal(second.ticket, "ticket2");
  assert.deepEqual(second.form, form);
  assert.deepEqual(log, ["start:ali:123456:ali@ornek.com", "start:ali:123456:ali@ornek.com"]);
}

// success:false → ApiError (kind client)
{
  const { flow } = setup({ start: { success: false, message: "Reddedildi" } });
  await assert.rejects(flow.start(form), (err: unknown) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.info.kind, "client");
    assert.equal(err.message, "Reddedildi");
    return true;
  });
}
{
  const { flow } = setup({ confirm: { success: false, message: "Onaylanmadı" } });
  const step: RegistrationCodeStep = { step: "code", form, ticket: "t", maskedEmail: "" };
  await assert.rejects(flow.confirm(step, "123456"), (err: unknown) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.message, "Onaylanmadı");
    return true;
  });
}

// token ya da kullanıcı eksik gelirse sessizce oturum açılmaz
for (const broken of [{ token: "" }, { user: undefined as unknown as RegisterConfirmResponse["user"] }]) {
  const { flow } = setup({ confirm: broken });
  const step: RegistrationCodeStep = { step: "code", form, ticket: "t", maskedEmail: "" };
  await assert.rejects(flow.confirm(step, "123456"), (err: unknown) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.message, "Sunucudan beklenmeyen bir cevap geldi.");
    return true;
  });
}

// sunucu hatası (yanlış kod, kalan deneme hakkı) olduğu gibi iletilir
{
  const original = new ApiError({
    kind: "client",
    message: "Girdiğiniz doğrulama kodu hatalı. Kalan deneme hakkı: 4",
    status: 400,
  });
  const { flow } = setup({ confirmError: original });
  const step: RegistrationCodeStep = { step: "code", form, ticket: "t", maskedEmail: "" };
  await assert.rejects(flow.confirm(step, "000000"), (err: unknown) => {
    assert.equal(err, original);
    return true;
  });
}

console.log("registration-flow testleri geçti ✅");