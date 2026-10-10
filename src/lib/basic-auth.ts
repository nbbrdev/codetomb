import { createHash, timingSafeEqual } from "node:crypto";

// Proteção do staging por HTTP Basic Auth (docs/07-seguranca.md §9). Todas as rotas pedem a senha,
// sem exceções por enquanto (NBB-106 E5-A).

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

// Compara em tempo constante: o tempo de resposta não revela quantos caracteres estavam certos.
// O hash iguala o tamanho dos dois lados, exigência do `timingSafeEqual`. Nada é armazenado: o
// SHA-256 aqui não é "hash de senha" (esse papel é do Better Auth, ADR-0002).
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

/** Confere o header `Authorization: Basic <base64(usuario:senha)>` contra as credenciais esperadas. */
export function isAuthorized(
  authorization: string | null,
  expectedUser: string,
  expectedPassword: string,
): boolean {
  if (!authorization?.startsWith("Basic ")) {
    return false;
  }

  const decoded = Buffer.from(authorization.slice("Basic ".length), "base64").toString("utf8");
  // O usuário não pode conter ":"; a senha pode (RFC 7617).
  const separator = decoded.indexOf(":");
  if (separator === -1) {
    return false;
  }

  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  // Avalia os dois lados sempre, sem curto-circuito, para não vazar qual deles errou.
  const userOk = safeEqual(user, expectedUser);
  const passwordOk = safeEqual(password, expectedPassword);
  return userOk && passwordOk;
}
