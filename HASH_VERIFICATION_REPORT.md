# Payment Files Hash Verification Report
**Generated**: February 18, 2026  
**Purpose**: Verify code integrity between local and deployed versions

---

## LOCAL FILES (SHA-256 Hashes)

### Request Files
| File | SHA-256 Hash |
|------|--------------|
| `src/app/api/payment/create-order/route.ts` | `FB5A8FBA8F750DC6D94CDAE1D75FC1290CF34187A10E9BAF77CCAB9A38E28200` |

### Response/Callback Files
| File | SHA-256 Hash |
|------|--------------|
| `src/app/api/payment/callback/route.ts` | `806AA390F5B29EE75B3C46427B389E362ECFED0D9106B89D70E2ECBD3ED1BAB0` |

### Library Files
| File | SHA-256 Hash |
|------|--------------|
| `src/lib/razorpay.ts` | `AF11C0966499AC62320B8481BA01A58D4068D97162A68FBF9879A02C2E416EE7` |
| `src/lib/paymentService.ts` | `8F2AB4F351F9F8B73A63B92A4D6966289A578039BA918FA3E51702340257F647` |
| `src/types/payment.ts` | `FBAC9773271CECC66D7080D4D5EDC075DFF1D68AF9471EB19A475E756625C3CF` |

---

## DEPLOYED FILES (GitHub Master Branch - SHA-256 Hashes)

### Request Files
| File | SHA-256 Hash |
|------|--------------|
| `src/app/api/payment/create-order/route.ts` | `642D2BA859F6D152F6F0E6BF90BA438AC9BE67E7594BEC687572C1A2211C8311` |

### Response/Callback Files
| File | SHA-256 Hash |
|------|--------------|
| `src/app/api/payment/callback/route.ts` | `990E50589E28E24DFEAA857D20DC3496603E1E2558D3583DB28562E18294BA5C` |

---

## Hash Mismatch Analysis

### ❌ Files with differences (Need sync):
1. **create-order/route.ts** - Local ≠ Deployed
   - Local: `FB5A8FBA...38E28200`
   - Deployed: `642D2BA8...1C8311`

2. **callback/route.ts** - Local ≠ Deployed
   - Local: `806AA390...ED1BAB0`
   - Deployed: `990E50589...94BA5C`

### ✅ Action Required:
- Push uncommitted changes to GitHub, OR
- Revert to deployed version locally

---

## Generation Method
```powershell
# Command used for each file:
Get-FileHash -Algorithm SHA256 "file_path"
```

**OS**: Windows PowerShell 5.1  
**Algorithm**: SHA-256  
**Encoding**: UTF-8
