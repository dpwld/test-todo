# Auth Route Contracts

**Feature**: 002-auth-cloud-storage
**Date**: 2026-05-22

---

## 라우트 보호 정책

| 경로 | 인증 필요 | 비인증 시 동작 | 인증됨 시 동작 |
|------|-----------|----------------|----------------|
| `/` | ❌ | 그대로 표시 | `/main`으로 리다이렉트 |
| `/main` | ✅ | `/`으로 리다이렉트 | 그대로 표시 |
| `/calendar` | ✅ | `/`으로 리다이렉트 | 그대로 표시 |
| `/stats` | ✅ | `/`으로 리다이렉트 | 그대로 표시 |
| `/auth/callback` | ❌ | OAuth 코드 교환 처리 | OAuth 코드 교환 처리 |

---

## OAuth Callback Route

**경로**: `GET /auth/callback`

**역할**: Google OAuth 인증 완료 후 Supabase가 리다이렉트하는 엔드포인트.
`code` 파라미터를 세션 토큰으로 교환하고 `/main`으로 이동.

**파라미터**:
| 파라미터 | 위치 | 타입 | 설명 |
|---------|------|------|------|
| code | query | string | Supabase OAuth 인가 코드 |
| next | query | string (optional) | 인증 후 이동할 경로 (기본: `/main`) |

**응답**:
- 성공: `302 /main` (또는 `next` 파라미터 경로)
- 실패: `302 /?error=auth_callback_error`

---

## AuthProvider 컨텍스트 인터페이스

`src/lib/store/AuthProvider.tsx`가 내려주는 컨텍스트 값.

```typescript
interface AuthContextValue {
  user: User | null;           // Supabase User 객체 (비인증 시 null)
  loading: boolean;            // 세션 로드 중 여부
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signUp: (email: string, password: string) => Promise<AuthError | null>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

**오류 메시지 매핑** (한국어):

| Supabase 오류 코드 | 표시 메시지 |
|-------------------|------------|
| `invalid_credentials` | 이메일 또는 비밀번호가 올바르지 않습니다. |
| `user_already_exists` | 이미 사용 중인 이메일입니다. |
| `weak_password` | 비밀번호는 최소 8자 이상이어야 합니다. |
| 네트워크 오류 | 연결에 실패했습니다. 잠시 후 다시 시도해주세요. |
| 기타 | 오류가 발생했습니다. 다시 시도해주세요. |
