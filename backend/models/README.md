# TrueAccord Data Models - Project Structure

This directory contains the TrueAccord Recover API data models organized into a clean folder structure.

## 📁 Folder Structure

```
models/
├── original-models/          # Original scraped model definitions (18 files)
│   ├── Customer.json
│   ├── Debt.json
│   ├── MonetaryAmount.json
│   ├── Date.json
│   ├── PostalAddress.json
│   ├── PhoneNumber.json
│   ├── Payment.json
│   ├── BalanceSnapshot.json
│   ├── PaymentPlan.json
│   ├── AttorneyRepresentation.json
│   ├── DebtConsolidatorRepresentation.json
│   ├── Creditor.json
│   ├── CreditorBrand.json
│   ├── Metadata.json
│   ├── DataSource.json
│   ├── Error.json
│   ├── DuplicatedReference.json
│   └── Timestamp.json
│
├── mapparser-models/         # MapParser transformed models (18 files)
│   ├── Customer-MapParser.json
│   ├── Debt-MapParser.json
│   ├── MonetaryAmount-MapParser.json
│   ├── Date-MapParser.json
│   ├── PostalAddress-MapParser.json
│   ├── PhoneNumber-MapParser.json
│   ├── Payment-MapParser.json
│   ├── BalanceSnapshot-MapParser.json
│   ├── PaymentPlan-MapParser.json
│   ├── AttorneyRepresentation-MapParser.json
│   ├── DebtConsolidatorRepresentation-MapParser.json
│   ├── Creditor-MapParser.json
│   ├── CreditorBrand-MapParser.json
│   ├── Metadata-MapParser.json
│   ├── DataSource-MapParser.json
│   ├── Error-MapParser.json
│   ├── DuplicatedReference-MapParser.json
│   └── Timestamp-MapParser.json
│
├── templates/                # Master templates and reference files
│   ├── sample.json                           # Original MapParser structure reference
│   ├── trueaccord-data-models.json          # Consolidated original models
│   └── trueaccord-mapparser-template.json   # Master integration template
│
├── documentation/            # Project documentation
│   ├── TASKS.md                  # Task breakdown (17 tasks across 5 phases)
│   ├── VALIDATION_REPORT.md      # Comprehensive validation results
│   └── SUMMARY.md                # Project overview and usage guide
│
└── README.md                 # This file

```

## 📋 Quick Reference

### Original Models
Contains the raw data model definitions scraped from TrueAccord Recover API documentation. These files preserve the original structure with types, descriptions, and required flags.

**Use Case:** Reference for understanding the API structure and field definitions.

### MapParser Models
Production-ready MapParser format models following the pattern:
```json
{
  "fieldName": {
    "id": "MapParser",
    "type": "data|static|expression",
    "value": "...",
    "dataType": "number|amount|boolean"
  }
}
```

**Use Case:** Ready to integrate with MapParser processing pipeline.

### Templates
- **sample.json** - Original reference pattern for MapParser structure
- **trueaccord-data-models.json** - All 18 models in one consolidated file
- **trueaccord-mapparser-template.json** - Master template showing complete integration with Customer→Debt hierarchy

**Use Case:** Integration templates and reference patterns.

### Documentation
- **TASKS.md** - Complete task breakdown showing how models were transformed
- **VALIDATION_REPORT.md** - Detailed validation of all models with compliance checks
- **SUMMARY.md** - Usage instructions, key features, and quick reference tables

**Use Case:** Understanding the project, validation details, and usage instructions.

## 🚀 Next Steps

1. **Review Documentation:** Start with `documentation/SUMMARY.md`
2. **Customize Models:** Update field references in `mapparser-models/` to match your data source
3. **Test Integration:** Use `templates/trueaccord-mapparser-template.json` as integration guide
4. **Validate:** Reference `documentation/VALIDATION_REPORT.md` for compliance checks

## 📊 Project Statistics

- **Total Models:** 18 data models
- **Files Created:** 41 files (18 original + 18 MapParser + 3 templates + 3 docs)
- **Compliance:** 100% MapParser structure compliance
- **Coverage:** Complete TrueAccord Recover API field coverage

---

**Source:** TrueAccord Recover API Documentation  
**Format:** MapParser Structure  
**Created:** November 2025
