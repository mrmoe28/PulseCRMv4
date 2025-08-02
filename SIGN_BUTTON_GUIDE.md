# E-Signature Button Visibility Guide

## Sign Button Shows When:
- Document type is PDF (`application/pdf`)
- Status is NOT 'signed'
- Status is NOT 'completed'

## Document Statuses:
- **draft** ✅ Can sign
- **pending_signature** ✅ Can sign
- **signed** ❌ Already signed
- **completed** ❌ Finalized
- **undefined/null** ✅ Can sign (newly uploaded)

## Visual Indicators:
- 🖊️ **Orange pen icon** - Available for signing
- 👁️ **Eye icon** - View document
- ⬇️ **Download icon** - Download file
- 🗑️ **Trash icon** - Delete document

## After Signing:
- Document status updates to 'signed'
- Sign button disappears
- Status badge shows green "Signed" label
- Document is preserved with signatures
